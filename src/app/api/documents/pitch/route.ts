import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PITCH_FIELDS = ["FM-01", "FM-02", "P1-07", "P3-04", "P2-08", "P6-01", "P6-02"];

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const coopId = searchParams.get("coopId");
    if (!coopId) return NextResponse.json({ error: "coopId required" }, { status: 400 });

    const membership = await prisma.coopMember.findUnique({
      where: { coopId_userId: { coopId, userId: session.user.id } },
    });
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const entries = await prisma.handbookEntry.findMany({
      where: { coopId, fieldId: { in: PITCH_FIELDS } },
    });

    const fields: Record<string, string> = {};
    for (const e of entries) fields[e.fieldId] = e.value;

    const coopName = fields["FM-01"] || "our co-op";

    const prompt = `You are writing a one-page community pitch document for a worker-owned cooperative.

Here is the information available from their handbook:

Co-op name (FM-01): ${fields["FM-01"] || "[not yet filled in]"}
Tagline (FM-02): ${fields["FM-02"] || "[not yet filled in]"}
Three brand words (P6-01): ${fields["P6-01"] || "[not yet filled in]"}
Brand story (P6-02): ${fields["P6-02"] || "[not yet filled in]"}
90-second story (P1-07): ${fields["P1-07"] || "[not yet filled in]"}
Value proposition (P3-04): ${fields["P3-04"] || "[not yet filled in]"}
Community supporters (P2-08): ${fields["P2-08"] || "[not yet filled in]"}

Write a clean, human, shareable one-page community pitch for ${coopName}.

Format it with these sections using markdown:
- A bold headline with the co-op name and tagline
- "Who We Are" — 2-3 sentences from the brand story
- "The Problem We're Solving" — pulled from the 90-second story
- "What We're Building" — the value proposition, made human
- "Get Involved" — a short call to action based on community supporters
- A closing line that captures the feeling of the three brand words

Rules:
- Write in first person plural ("we", "our")
- Keep each section to 2-4 sentences maximum
- No jargon, no corporate language
- If a section has "[not yet filled in]", skip it gracefully rather than leaving a blank
- The whole document should fit on one printed page
- End with: "Part of Project 2026 — The Fledge, 1300 Eureka Street, Lansing, Michigan"`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ content: text, fields: Object.keys(fields).length, total: PITCH_FIELDS.length });
  } catch (err) {
    console.error("GET /api/documents/pitch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
