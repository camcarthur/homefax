import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SERVICE_INTERVAL_YEARS: Record<string, number> = {
  RESTAIN: 3,
  RECHINK: 10,
  WASH: 1,
  INSPECTION: 1,
  MEDIA_BLAST: 7,
};

function addYears(date: Date, years: number) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  const tags = await prisma.tag.findMany({
    where: {
      home: {
        is: {
          events: { some: { companyId } },
        },
      },
    },
    include: {
      home: {
        include: {
          events: {
            orderBy: { performedOn: "desc" },
            include: { company: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  const result = tags.map((t) => {
    const home = t.home!;
    const events = home.events;

    const nextDue: Record<string, { last?: string; due?: string; overdue: boolean }> = {};

    for (const [serviceType, years] of Object.entries(SERVICE_INTERVAL_YEARS)) {
      const last = events.find((e) => e.serviceType === serviceType);
      if (!last) {
        nextDue[serviceType] = { overdue: false };
        continue;
      }
      const due = addYears(new Date(last.performedOn), years);
      nextDue[serviceType] = {
        last: new Date(last.performedOn).toISOString(),
        due: due.toISOString(),
        overdue: due.getTime() < now.getTime(),
      };
    }

    return {
      tag: { code: t.code, status: t.status },
      home: { id: home.id, label: home.label, address: home.address ?? null },
      nextDue,
    };
  });

  return NextResponse.json({ tags: result });
}
