import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { name, email, message, timeline } = await req.json();
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

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
  } else {
    console.log(`[contact] inquiry from ${email}: ${message}`);
  }

  return NextResponse.json({ ok: true });
}
