import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SERVICE_INTERVAL_YEARS = {
  RESTAIN: 3,
  RECHINK: 10,
  WASH: 1,
  INSPECTION: 1,
  MEDIA_BLAST: 7,
} as const;

type ServiceKey = keyof typeof SERVICE_INTERVAL_YEARS;

function addYears(date: Date, years: number) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

// Explicit type so TS never falls back to `any`
type TagRow = {
  code: string;
  status: string;
  home: {
    id: string;
    label: string;
    address: string | null;
    events: Array<{
      serviceType: string;
      performedOn: Date;
    }>;
  } | null;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  // Use select to keep payload small + predictable typing
  const tags: TagRow[] = await prisma.tag.findMany({
    where: {
      home: {
        is: {
          events: { some: { companyId } },
        },
      },
    },
    select: {
      code: true,
      status: true,
      home: {
        select: {
          id: true,
          label: true,
          address: true,
          events: {
            orderBy: { performedOn: "desc" },
            select: {
              serviceType: true,
              performedOn: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  const result = tags
    .filter((t) => t.home) // should always be true given the where clause, but keeps TS happy
    .map((t) => {
      const home = t.home!;
      const events = home.events;

      const nextDue: Record<
        ServiceKey,
        { last?: string; due?: string; overdue: boolean }
      > = {
        RESTAIN: { overdue: false },
        RECHINK: { overdue: false },
        WASH: { overdue: false },
        INSPECTION: { overdue: false },
        MEDIA_BLAST: { overdue: false },
      };

      (Object.keys(SERVICE_INTERVAL_YEARS) as ServiceKey[]).forEach((serviceType) => {
        const years = SERVICE_INTERVAL_YEARS[serviceType];
        const last = events.find((e) => e.serviceType === serviceType);

        if (!last) return;

        const due = addYears(new Date(last.performedOn), years);
        nextDue[serviceType] = {
          last: new Date(last.performedOn).toISOString(),
          due: due.toISOString(),
          overdue: due.getTime() < now.getTime(),
        };
      });

      return {
        tag: { code: t.code, status: t.status },
        home: { id: home.id, label: home.label, address: home.address ?? null },
        nextDue,
      };
    });

  return NextResponse.json({ tags: result });
}
