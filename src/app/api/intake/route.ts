import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const key = process.env.INTERNAL_API_KEY;
  if (!key || auth !== `Bearer ${key}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { email, message, source } = body;

  if (!email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "email and message required" }, { status: 400 });
  }

  const trimmed = message.trim();
  const title = trimmed.length > 80 ? trimmed.slice(0, 79) + "…" : trimmed;

  const request = await prisma.storyRequest.create({
    data: {
      title,
      description: trimmed,
      submitterEmail: email.trim().toLowerCase(),
      source: source?.trim() || "unknown",
    },
  });

  console.log(`[intake] new request #${request.id} from ${request.submitterEmail} via ${request.source}`);
  return NextResponse.json({ ok: true, id: request.id }, { status: 201 });
}
