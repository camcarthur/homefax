import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function randomCode(len = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function GET() {
  const tags = await prisma.tag.findMany({
    orderBy: { createdAt: "desc" },
    include: { home: true },
  });

  return NextResponse.json({ tags });
}

export async function POST() {
  for (let i = 0; i < 5; i++) {
    const code = randomCode(10);
    try {
      const tag = await prisma.tag.create({
        data: { code, status: "UNCLAIMED" },
      });
      return NextResponse.json({ tag });
    } catch {
      // retry on collision
    }
  }

  return NextResponse.json({ error: "Failed to create unique tag" }, { status: 500 });
}
