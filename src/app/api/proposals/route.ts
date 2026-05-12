import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const proposals = await prisma.proposal.findMany({
    include: {
      org: { select: { id: true, name: true } },
      contact: { select: { id: true, name: true } },
      items: true,
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(proposals);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, orgId, contactId, ratePerHour, projectDesc, expiresAt } = body;

  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const proposal = await prisma.proposal.create({
    data: {
      title: title.trim(),
      orgId: orgId || null,
      contactId: contactId || null,
      ratePerHour: parseInt(ratePerHour) || 150,
      projectDesc: projectDesc?.trim() || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
    include: {
      org: { select: { id: true, name: true } },
      contact: { select: { id: true, name: true } },
      items: true,
    },
  });
  return NextResponse.json(proposal, { status: 201 });
}
