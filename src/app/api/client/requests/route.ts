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

  const requests = await prisma.storyRequest.findMany({
    where: orgId ? { orgId } : { submittedById: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, description: true, status: true, createdAt: true, convertedToId: true },
  });

  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, orgId: bodyOrgId } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title is required." }, { status: 400 });

  // Determine orgId
  let orgId: string | null = bodyOrgId || null;
  if (!orgId) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { contact: { select: { orgId: true } } },
    });
    orgId = user?.contact?.orgId ?? null;
  }

  const request = await prisma.storyRequest.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      orgId,
      submittedById: session.user.id,
    },
  });

  return NextResponse.json(request, { status: 201 });
}
