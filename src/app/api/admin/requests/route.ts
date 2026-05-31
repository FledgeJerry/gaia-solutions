import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const requests = await prisma.storyRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      org: { select: { id: true, name: true } },
      submittedBy: { select: { id: true, name: true, email: true } },
      convertedTo: { select: { id: true, title: true, status: true } },
    },
  });

  return NextResponse.json(requests);
}
