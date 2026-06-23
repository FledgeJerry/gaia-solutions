import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sprint = await prisma.sprint.findUnique({
    where: { id },
    include: {
      stories: {
        select: { id: true, title: true, status: true, points: true, type: true },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
  if (!sprint) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(sprint);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { number, startDate, endDate, focus, reflection } = body;

  const sprint = await prisma.sprint.update({
    where: { id },
    data: {
      ...(number !== undefined && { number: parseInt(number) }),
      ...(startDate !== undefined && { startDate: new Date(startDate) }),
      ...(endDate !== undefined && { endDate: new Date(endDate) }),
      ...(focus !== undefined && { focus: focus?.trim() || null }),
      ...(reflection !== undefined && { reflection: reflection?.trim() || null }),
    },
  });
  return NextResponse.json(sprint);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Unassign linked stories first — they stay wherever they are on the board, just no longer tied to this sprint.
  await prisma.$transaction([
    prisma.story.updateMany({ where: { sprintId: id }, data: { sprintId: null } }),
    prisma.sprint.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
