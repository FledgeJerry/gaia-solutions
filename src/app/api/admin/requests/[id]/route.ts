import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PATCH: promote to story or decline
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { action, storyType } = await req.json();

  const request = await prisma.storyRequest.findUnique({ where: { id } });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "promote") {
    const story = await prisma.story.create({
      data: {
        title: request.title,
        type: storyType ?? "CLIENT",
        status: "BACKLOG",
        orgId: request.orgId,
        notes: request.description,
      },
    });
    const updated = await prisma.storyRequest.update({
      where: { id },
      data: { status: "CONVERTED", convertedToId: story.id },
      include: {
        org: { select: { id: true, name: true } },
        submittedBy: { select: { id: true, name: true, email: true } },
        convertedTo: { select: { id: true, title: true, status: true } },
      },
    });
    return NextResponse.json(updated);
  }

  if (action === "decline") {
    const updated = await prisma.storyRequest.update({
      where: { id },
      data: { status: "DECLINED" },
      include: {
        org: { select: { id: true, name: true } },
        submittedBy: { select: { id: true, name: true, email: true } },
        convertedTo: { select: { id: true, title: true, status: true } },
      },
    });
    return NextResponse.json(updated);
  }

  if (action === "reopen") {
    const updated = await prisma.storyRequest.update({
      where: { id },
      data: { status: "PENDING" },
      include: {
        org: { select: { id: true, name: true } },
        submittedBy: { select: { id: true, name: true, email: true } },
        convertedTo: { select: { id: true, title: true, status: true } },
      },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
