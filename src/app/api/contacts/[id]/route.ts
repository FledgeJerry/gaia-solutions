import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      org: true,
      interactions: { orderBy: { createdAt: "desc" }, include: { loggedBy: true } },
      stories: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(contact);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, orgId, role, email, phone, howWeMet, contextNote, decisionMaker } = body;

  const contact = await prisma.contact.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(orgId !== undefined && { orgId: orgId || null }),
      ...(role !== undefined && { role: role?.trim() || null }),
      ...(email !== undefined && { email: email?.trim() || null }),
      ...(phone !== undefined && { phone: phone?.trim() || null }),
      ...(howWeMet !== undefined && { howWeMet: howWeMet?.trim() || null }),
      ...(contextNote !== undefined && { contextNote: contextNote?.trim() || null }),
      ...(decisionMaker !== undefined && { decisionMaker: !!decisionMaker }),
    },
    include: { org: true },
  });

  return NextResponse.json(contact);
}
