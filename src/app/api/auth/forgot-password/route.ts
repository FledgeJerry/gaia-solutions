import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email?.trim()) return NextResponse.json({ error: "Email is required." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });

  // Always return success to avoid leaking whether an account exists
  if (!user) return NextResponse.json({ ok: true });

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.verificationToken.upsert({
    where: { identifier_token: { identifier: user.email, token } },
    update: { token, expires },
    create: { identifier: user.email, token, expires },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "gaia.solutions <noreply@gaia.solutions>",
      to: user.email,
      subject: "Reset your password",
      html: `<p>Click the link below to reset your password. It expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });
  } else {
    console.log(`[forgot-password] reset link for ${user.email}: ${resetUrl}`);
  }

  return NextResponse.json({ ok: true });
}
