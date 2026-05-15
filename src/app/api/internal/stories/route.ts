import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const key = process.env.INTERNAL_API_KEY;
  if (!key || auth !== `Bearer ${key}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, notes, type, orgId, points } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const story = await prisma.story.create({
    data: {
      title: title.trim(),
      notes: notes?.trim() || null,
      type: type || "INTERNAL",
      status: "BACKLOG",
      points: parseInt(points) || 1,
      orgId: orgId || null,
    },
    include: {
      org: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(story, { status: 201 });
}
