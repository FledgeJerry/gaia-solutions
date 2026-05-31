import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const previewOrgId = searchParams.get("orgId");

  let orgId: string | null = null;
  if (session.user.role === "ADMIN" && previewOrgId) {
    orgId = previewOrgId;
  } else {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { contact: { select: { orgId: true } } },
    });
    orgId = user?.contact?.orgId ?? null;
  }

  if (!orgId) return NextResponse.json([]);

  const meetings = await prisma.interaction.findMany({
    where: {
      type: "MEETING",
      contact: { orgId },
    },
    include: { contact: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(meetings.map(m => ({
    id: m.id,
    date: m.createdAt,
    contactName: m.contact.name,
    notes: m.notes,
    meaningful: m.meaningful,
  })));
}
