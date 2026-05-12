import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contacts = await prisma.contact.findMany({
    include: { org: true },
    orderBy: { lastTouchedAt: "desc" },
  });
  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, orgId, role, email, phone, howWeMet, contextNote, decisionMaker } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const contact = await prisma.contact.create({
    data: {
      name: name.trim(),
      orgId: orgId || null,
      role: role?.trim() || null,
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      howWeMet: howWeMet?.trim() || null,
      contextNote: contextNote?.trim() || null,
      decisionMaker: !!decisionMaker,
      lastTouchedAt: new Date(),
    },
    include: { org: true },
  });

  return NextResponse.json(contact, { status: 201 });
}
