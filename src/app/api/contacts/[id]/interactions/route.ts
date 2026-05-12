import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { type, notes, meaningful } = body;

  const [interaction] = await prisma.$transaction([
    prisma.interaction.create({
      data: {
        contactId: id,
        type: type || "OTHER",
        notes: notes?.trim() || null,
        meaningful: !!meaningful,
        loggedById: session.user?.id ?? null,
      },
      include: { loggedBy: true },
    }),
    prisma.contact.update({
      where: { id },
      data: { lastTouchedAt: new Date() },
    }),
  ]);

  return NextResponse.json(interaction, { status: 201 });
}
