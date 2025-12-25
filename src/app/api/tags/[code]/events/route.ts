import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const body = await req.json().catch(() => ({}));

  const { companyId, serviceType, performedOn, notes, material } = body as {
    companyId: string;
    serviceType: string;
    performedOn: string;
    notes?: string;
    material?: {
      category: string;
      brand: string;
      productLine?: string;
      colorName?: string;
      colorCode?: string;
      batchLot?: string;
    };
  };

  if (!companyId || !serviceType || !performedOn) {
    return NextResponse.json(
      { error: "companyId, serviceType, performedOn are required" },
      { status: 400 }
    );
  }

  const tag = await prisma.tag.findUnique({
    where: { code },
    include: { home: true },
  });

  if (!tag?.homeId) {
    return NextResponse.json({ error: "Tag is unclaimed" }, { status: 400 });
  }

  const event = await prisma.serviceEvent.create({
    data: {
      homeId: tag.homeId,
      companyId,
      serviceType: serviceType as any,
      performedOn: new Date(performedOn),
      notes: notes ?? null,
      materials: material
        ? {
            create: {
              category: material.category as any,
              brand: material.brand,
              productLine: material.productLine ?? null,
              colorName: material.colorName ?? null,
              colorCode: material.colorCode ?? null,
              batchLot: material.batchLot ?? null,
            },
          }
        : undefined,
    },
    include: { materials: true, company: true },
  });

  return NextResponse.json({ event });
}
