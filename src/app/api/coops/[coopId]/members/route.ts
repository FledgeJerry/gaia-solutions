import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ coopId: string }> };

async function requireOwner(userId: string, coopId: string) {
  const m = await prisma.coopMember.findUnique({
    where: { coopId_userId: { coopId, userId } },
  });
  return m?.role === "OWNER" ? m : null;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { coopId } = await params;

    const membership = await prisma.coopMember.findUnique({
      where: { coopId_userId: { coopId, userId: session.user.id } },
    });
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const members = await prisma.coopMember.findMany({
      where: { coopId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { role: "asc" },
    });

    return NextResponse.json(members.map((m) => ({ id: m.id, role: m.role, user: m.user })));
  } catch (err) {
    console.error("GET /api/coops/[coopId]/members error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { coopId } = await params;

    const owner = await requireOwner(session.user.id, coopId);
    if (!owner) return NextResponse.json({ error: "Only owners can add members" }, { status: 403 });

    const { email } = await req.json();
    if (!email?.trim()) return NextResponse.json({ error: "email required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) return NextResponse.json({ error: "No account found for that email" }, { status: 404 });

    const existing = await prisma.coopMember.findUnique({
      where: { coopId_userId: { coopId, userId: user.id } },
    });
    if (existing) return NextResponse.json({ error: "Already a member" }, { status: 409 });

    const member = await prisma.coopMember.create({
      data: { coopId, userId: user.id, role: "EDITOR" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ id: member.id, role: member.role, user: member.user });
  } catch (err) {
    console.error("POST /api/coops/[coopId]/members error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { coopId } = await params;
    const { memberId } = await req.json();

    const owner = await requireOwner(session.user.id, coopId);
    if (!owner) return NextResponse.json({ error: "Only owners can remove members" }, { status: 403 });

    const member = await prisma.coopMember.findUnique({ where: { id: memberId } });
    if (!member || member.coopId !== coopId) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (member.role === "OWNER") return NextResponse.json({ error: "Cannot remove the owner" }, { status: 400 });

    await prisma.coopMember.delete({ where: { id: memberId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/coops/[coopId]/members error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
