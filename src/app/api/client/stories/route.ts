import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const previewOrgId = searchParams.get("orgId");

  // Admins can preview any org; clients get their own org
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

  const stories = await prisma.story.findMany({
    where: {
      orgId,
      status: { in: ["IN_PROGRESS", "REVIEW", "DONE"] },
    },
    select: { id: true, title: true, status: true, type: true, points: true, updatedAt: true },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json(stories);
}
