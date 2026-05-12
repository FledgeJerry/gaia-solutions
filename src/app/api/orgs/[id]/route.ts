import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const org = await prisma.org.findUnique({
    where: { id },
    include: {
      contacts: { orderBy: { lastTouchedAt: "desc" } },
      stories: { orderBy: { updatedAt: "desc" }, take: 20 },
    },
  });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(org);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, type, website, notes } = body;

  const org = await prisma.org.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(type !== undefined && { type }),
      ...(website !== undefined && { website: website?.trim() || null }),
      ...(notes !== undefined && { notes: notes?.trim() || null }),
    },
  });
  return NextResponse.json(org);
}
