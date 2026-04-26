import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInvite } from "@/lib/email";

// GET /api/invite?email=... — check if account exists
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.toLowerCase().trim();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return NextResponse.json({ exists: !!user });
}

// POST /api/invite — send invite to email that has no account
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

    const normalized = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalized }, select: { id: true } });
    if (user) return NextResponse.json({ error: "Account already exists" }, { status: 409 });

    await sendInvite(normalized);
    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("POST /api/invite error:", err);
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 });
  }
}
