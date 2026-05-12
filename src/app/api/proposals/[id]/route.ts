import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      org: true,
      contact: true,
      items: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(proposal);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, orgId, contactId, status, projectDesc, coverLetter, termsNote, ratePerHour, expiresAt } = body;

  const sentAt = status === "SENT"
    ? (await prisma.proposal.findUnique({ where: { id }, select: { sentAt: true } }))?.sentAt ?? new Date()
    : undefined;

  const shareToken = status === "SENT"
    ? (await prisma.proposal.findUnique({ where: { id }, select: { shareToken: true } }))?.shareToken
      ?? randomBytes(16).toString("hex")
    : undefined;

  const proposal = await prisma.proposal.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(orgId !== undefined && { orgId: orgId || null }),
      ...(contactId !== undefined && { contactId: contactId || null }),
      ...(status !== undefined && { status }),
      ...(projectDesc !== undefined && { projectDesc: projectDesc?.trim() || null }),
      ...(coverLetter !== undefined && { coverLetter }),
      ...(termsNote !== undefined && { termsNote: termsNote?.trim() || null }),
      ...(ratePerHour !== undefined && { ratePerHour: parseInt(ratePerHour) }),
      ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      ...(sentAt !== undefined && { sentAt }),
      ...(shareToken !== undefined && { shareToken }),
    },
    include: {
      org: true,
      contact: true,
      items: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });
  return NextResponse.json(proposal);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.proposal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
