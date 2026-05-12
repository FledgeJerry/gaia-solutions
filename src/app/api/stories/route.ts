import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stories = await prisma.story.findMany({
    include: {
      contact: { select: { id: true, name: true } },
      org: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
      sprint: { select: { id: true, number: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(stories);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, type, points, status, contactId, orgId, sprintId } = body;

  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const userId = session.user?.id;
  if (userId) {
    const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!userExists) return NextResponse.json({ error: "Session user not found — please log out and back in." }, { status: 401 });
  }

  try {
    const story = await prisma.story.create({
      data: {
        title: title.trim(),
        type: type || "INTERNAL",
        points: parseInt(points) || 1,
        status: status || "BACKLOG",
        contactId: contactId || null,
        orgId: orgId || null,
        sprintId: sprintId || null,
        assignedToId: userId ?? null,
      },
      include: {
        contact: { select: { id: true, name: true } },
        org: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(story, { status: 201 });
  } catch (err) {
    console.error("story create error:", err);
    return NextResponse.json({ error: (err as Error).message ?? "Database error" }, { status: 500 });
  }
}
