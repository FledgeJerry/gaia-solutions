import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, status, type, points, blocked, flagged, contactId, orgId, sprintId } = body;

  const story = await prisma.story.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(status !== undefined && { status }),
      ...(type !== undefined && { type }),
      ...(points !== undefined && { points: parseInt(points) }),
      ...(blocked !== undefined && { blocked: !!blocked }),
      ...(flagged !== undefined && { flagged: !!flagged }),
      ...(contactId !== undefined && { contactId: contactId || null }),
      ...(orgId !== undefined && { orgId: orgId || null }),
      ...(sprintId !== undefined && { sprintId: sprintId || null }),
    },
    include: {
      contact: { select: { id: true, name: true } },
      org: { select: { id: true, name: true } },
      sprint: { select: { id: true, number: true } },
    },
  });
  return NextResponse.json(story);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.story.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
