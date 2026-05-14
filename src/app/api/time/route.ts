import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = session.user.role === "ADMIN";
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const weeks = parseInt(searchParams.get("weeks") ?? "4", 10);

  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);

  const entries = await prisma.timeEntry.findMany({
    where: {
      userId: isAdmin && userId ? userId : isAdmin && !userId ? undefined : session.user.id,
      date: { gte: since },
    },
    include: { user: { select: { id: true, name: true } }, org: { select: { id: true, name: true } } },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { date, hours, category, notes, orgId } = body;

  if (!date || !hours || hours <= 0 || hours > 24)
    return NextResponse.json({ error: "Valid date and hours (0–24) are required." }, { status: 400 });

  const entry = await prisma.timeEntry.create({
    data: {
      userId: session.user.id,
      date: new Date(date),
      hours: parseFloat(hours),
      category: category ?? "DEVELOPMENT",
      notes: notes?.trim() || null,
      orgId: orgId || null,
    },
    include: { user: { select: { id: true, name: true } }, org: { select: { id: true, name: true } } },
  });

  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const entry = await prisma.timeEntry.findUnique({ where: { id } });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (entry.userId !== session.user.id && session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.timeEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
