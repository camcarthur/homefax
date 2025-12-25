import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const homes = await prisma.home.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ homes });
}
