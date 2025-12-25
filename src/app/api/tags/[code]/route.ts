import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const tag = await prisma.tag.findUnique({
    where: { code },
    include: {
      home: {
        include: {
          events: {
            orderBy: { performedOn: "desc" },
            include: { company: true, materials: true },
          },
        },
      },
    },
  });

  if (!tag) return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  if (!tag.home) return NextResponse.json({ status: "UNCLAIMED" });

  return NextResponse.json({
    status: "CLAIMED",
    tag: { code: tag.code, status: tag.status },
    home: tag.home,
  });
}
