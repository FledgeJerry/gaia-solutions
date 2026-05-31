import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const weeks = parseInt(searchParams.get("weeks") ?? "12", 10);

  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);

  const entries = await prisma.timeEntry.findMany({
    where: { date: { gte: since } },
    include: {
      user: { select: { id: true, name: true } },
      org: { select: { id: true, name: true } },
    },
    orderBy: { date: "asc" },
  });

  // By member
  const memberMap = new Map<string, { id: string; name: string | null; hours: number }>();
  for (const e of entries) {
    const key = e.userId;
    if (!memberMap.has(key)) memberMap.set(key, { id: e.user.id, name: e.user.name, hours: 0 });
    memberMap.get(key)!.hours += e.hours;
  }
  const byMember = [...memberMap.values()].sort((a, b) => b.hours - a.hours);

  // By org
  const orgMap = new Map<string, { id: string; name: string; hours: number }>();
  for (const e of entries) {
    if (!e.org) continue;
    const key = e.orgId!;
    if (!orgMap.has(key)) orgMap.set(key, { id: e.org.id, name: e.org.name, hours: 0 });
    orgMap.get(key)!.hours += e.hours;
  }
  const byOrg = [...orgMap.values()].sort((a, b) => b.hours - a.hours);

  // Weekly totals
  const weekMap = new Map<string, number>();
  for (const e of entries) {
    const d = new Date(e.date);
    const mon = new Date(d);
    mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = mon.toISOString().slice(0, 10);
    weekMap.set(key, (weekMap.get(key) ?? 0) + e.hours);
  }
  // Fill in zero weeks
  for (let w = 0; w < weeks; w++) {
    const d = new Date();
    d.setDate(d.getDate() - w * 7 - ((d.getDay() + 6) % 7));
    const key = d.toISOString().slice(0, 10);
    if (!weekMap.has(key)) weekMap.set(key, 0);
  }
  const weekly = [...weekMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, hours]) => ({ weekStart, hours }));

  // By category
  const catMap = new Map<string, number>();
  for (const e of entries) {
    catMap.set(e.category, (catMap.get(e.category) ?? 0) + e.hours);
  }
  const byCategory = [...catMap.entries()]
    .map(([category, hours]) => ({ category, hours }))
    .sort((a, b) => b.hours - a.hours);

  return NextResponse.json({ byMember, byOrg, weekly, byCategory });
}
