import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true, email: true, city: true, state: true, ageRange: true,
      gender: true, raceEthnicity: true, hasIdea: true, foundingGroup: true,
      biggestBarrier: true, readinessStage: true, workedAtCoop: true,
      wouldConvert: true, emailSubscribed: true,
    },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const allowed = [
    "name", "city", "state", "ageRange", "gender", "raceEthnicity",
    "hasIdea", "foundingGroup", "biggestBarrier", "readinessStage",
    "workedAtCoop", "wouldConvert", "emailSubscribed",
  ];
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { id: true },
  });

  return NextResponse.json(user);
}
