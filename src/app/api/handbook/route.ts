import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const entries = await prisma.handbookEntry.findMany({
      where: { userId: session.user.id },
      select: { fieldId: true, value: true, updatedAt: true },
    });

    return NextResponse.json(entries);
  } catch (err) {
    console.error("GET /api/handbook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fieldId, value } = await req.json();
  if (!fieldId) return NextResponse.json({ error: "fieldId required" }, { status: 400 });

  const entry = await prisma.handbookEntry.upsert({
    where: { userId_fieldId: { userId: session.user.id, fieldId } },
    update: { value },
    create: { userId: session.user.id, fieldId, value },
  });

  return NextResponse.json(entry);
}
