import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { name, email, message, timeline } = await req.json();
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  const description = [
    `Name: ${name.trim()}`,
    timeline ? `Timeline: ${timeline}` : null,
    `\n${message.trim()}`,
  ].filter(Boolean).join("\n");

  const trimmedMsg = message.trim();
  const title = trimmedMsg.length > 80 ? trimmedMsg.slice(0, 79) + "…" : trimmedMsg;

  await prisma.storyRequest.create({
    data: {
      title,
      description,
      submitterEmail: email.trim().toLowerCase(),
      source: "gaia.solutions",
    },
  });

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "gaia.solutions <noreply@gaia.solutions>",
      to: "jerry@thefledge.com",
      replyTo: email.trim(),
      subject: `New project inquiry from ${name.trim()}`,
      html: `
        <p><strong>Name:</strong> ${name.trim()}</p>
        <p><strong>Email:</strong> ${email.trim()}</p>
        ${timeline ? `<p><strong>Timeline:</strong> ${timeline}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap">${message.trim()}</p>
      `,
    });
  }

  return NextResponse.json({ ok: true });
}
