import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EXEC_FIELDS = [
  "FM-01", "FM-02", "FM-03", "FM-04", "FM-05", "FM-06", "FM-07",
  "P1-03", "P1-04", "P1-05", "P1-06",
  "P2-07",
  "P3-04", "P3-05", "P3-06",
  "P8-10", "P8-11",
  "P10-01", "P10-02",
];

const FIELD_LABELS: Record<string, string> = {
  "FM-01": "Co-op name",
  "FM-02": "Tagline",
  "FM-03": "Geography served",
  "FM-04": "Industry/sector",
  "FM-05": "Core values",
  "FM-06": "Ethical commitments",
  "FM-07": "Planned incorporation date",
  "P1-03": "What we are building",
  "P1-04": "Who we serve",
  "P1-05": "Why a cooperative",
  "P1-06": "10-year vision",
  "P2-07": "Target worker-owners by Year 3",
  "P3-04": "Value proposition",
  "P3-05": "Market size estimate",
  "P3-06": "Community impact",
  "P8-10": "Total startup capital needed",
  "P8-11": "Funding plan",
  "P10-01": "Products and services",
  "P10-02": "Pricing",
};

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
      where: { coopId, fieldId: { in: EXEC_FIELDS } },
    });

    const fields: Record<string, string> = {};
    for (const e of entries) fields[e.fieldId] = e.value;

    const filledCount = Object.keys(fields).length;
    const coopName = fields["FM-01"] || "our co-op";

    const fieldSummary = EXEC_FIELDS
      .map((id) => `${FIELD_LABELS[id]} (${id}): ${fields[id] || "[not yet filled in]"}`)
      .join("\n");

    const prompt = `You are writing a professional Executive Summary for a worker-owned cooperative seeking grants and partnerships.

Here is the information from their handbook:

${fieldSummary}

Return a JSON object with exactly these keys. Each value is a string of 2–4 sentences in clean, professional prose. Write in first person plural ("we", "our"). No jargon, no corporate language. If a section has "[not yet filled in]", synthesize from adjacent fields or write a brief placeholder in brackets.

Keys:
- "coopName": Just the co-op name as a string.
- "tagline": The tagline, or a one-sentence summary of the mission if not filled in.
- "overview": Who we are, what we do, where we operate, and why we're a cooperative. Pull from FM-01 through FM-04 and P1-03.
- "problem": The specific problem or gap in the market that this co-op addresses. Draw from P1-03 and P1-04.
- "solution": What we've built — the specific product or service, and how cooperative ownership makes it different. Pull from P1-03, P1-05, P3-04, P10-01, P10-02.
- "market": The opportunity — size of need, who's underserved, why now. Draw from P3-05, FM-03, FM-04.
- "impact": How the broader community is stronger because this co-op exists. Economic impact, job quality, community rootedness. From P3-06.
- "team": How many founding worker-owners, their target size by Year 3, and what ownership means to them. From P1-04, P1-05, P2-07.
- "financials": Startup capital needed, how it will be funded, and a brief note on pricing or revenue model. From P8-10, P8-11, P10-02.
- "vision": The 10-year dream. Bold, human, specific. From P1-06.
- "values": The core values and ethical commitments in 2–3 sentences. From FM-05, FM-06.

Co-op name: ${coopName}

Return ONLY the JSON object. No explanation, no markdown, no code fences.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const summary = JSON.parse(cleaned);

    return NextResponse.json({ summary, coopName, fields: filledCount, total: EXEC_FIELDS.length });
  } catch (err) {
    console.error("GET /api/documents/executive-summary error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
