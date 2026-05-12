import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgs = await prisma.org.findMany({
    include: { _count: { select: { contacts: true, stories: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(orgs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, type, website, notes } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const org = await prisma.org.create({
    data: {
      name: name.trim(),
      type: type || "COMMUNITY",
      website: website?.trim() || null,
      notes: notes?.trim() || null,
    },
  });
  return NextResponse.json(org, { status: 201 });
}
