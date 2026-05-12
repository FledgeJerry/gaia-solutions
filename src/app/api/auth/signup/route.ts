import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!email?.trim() || !password || !name?.trim())
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });

  if (password.length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (existing)
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name: name.trim(), email: email.trim().toLowerCase(), passwordHash, role: "ADMIN" },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
