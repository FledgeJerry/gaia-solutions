import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sprints = await prisma.sprint.findMany({
    include: { _count: { select: { stories: true } } },
    orderBy: { number: "desc" },
  });
  return NextResponse.json(sprints);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { number, startDate, endDate, focus } = body;

  if (!number) return NextResponse.json({ error: "Sprint number is required" }, { status: 400 });
  if (!startDate || !endDate) return NextResponse.json({ error: "Start and end date are required" }, { status: 400 });

  try {
    const sprint = await prisma.sprint.create({
      data: {
        number: parseInt(number),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        focus: focus?.trim() || null,
      },
    });
    return NextResponse.json(sprint, { status: 201 });
  } catch (err) {
    console.error("sprint create error:", err);
    return NextResponse.json({ error: "A sprint with that number already exists" }, { status: 409 });
  }
}
