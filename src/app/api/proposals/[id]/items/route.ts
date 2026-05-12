import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, description, hours, sortOrder } = body;

  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const item = await prisma.proposalLineItem.create({
    data: {
      proposalId: id,
      title: title.trim(),
      description: description?.trim() || null,
      hours: parseFloat(hours) || 0,
      sortOrder: sortOrder ?? 0,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
