import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await prisma.coopMember.findMany({
    where: { userId: session.user.id },
    include: { coop: { select: { id: true, name: true, createdAt: true } } },
    orderBy: { coop: { createdAt: "asc" } },
  });

  return NextResponse.json(memberships.map((m) => ({ ...m.coop, role: m.role })));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

  const coop = await prisma.coop.create({
    data: {
      name: name.trim(),
      members: {
        create: { userId: session.user.id, role: "OWNER" },
      },
    },
  });

  return NextResponse.json({ ...coop, role: "OWNER" });
}
