import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const body = await req.json().catch(() => ({}));
  const homeId = body.homeId as string | undefined;

  if (!homeId) {
    return NextResponse.json({ error: "homeId is required" }, { status: 400 });
  }

  const tag = await prisma.tag.update({
    where: { code },
    data: { homeId, status: "CLAIMED" },
    include: { home: true },
  });

  return NextResponse.json({ tag });
}
