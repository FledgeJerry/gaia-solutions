import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SCORECARD_FIELDS = [
  "FM-01", "FM-05", "FM-06", "P1-06",
  // People
  "P3-WO", "P5-01", "P5-05", "P7-01", "P7-02", "P7-03", "P13-01", "P13-02",
  // Planet
  "P7-04", "P7-05", "P9-05", "P13-03", "P13-04",
  // Profit
  "P2-07", "P7-06", "P13-05", "P13-06",
  // Ownership
  "P7-07", "P7-08", "P11-03g", "P13-07", "P13-08",
  // Review cadence
  "P13-09",
];

const FIELD_LABELS: Record<string, string> = {
  "FM-01": "Co-op name",
  "FM-05": "Core values",
  "FM-06": "Ethical commitments",
  "P1-06": "10-year vision",
  "P3-WO": "What a good job looks like here",
  "P5-01": "Standard for how worker-owners treat each other",
  "P5-05": "How worker-owner satisfaction is measured",
  "P7-01": "Three concrete dignity practices",
  "P7-02": "Living wage target (hourly)",
  "P7-03": "Maximum wage ratio",
  "P13-01": "People KPI 1",
  "P13-02": "People KPI 2",
  "P7-04": "Environmental commitments",
  "P7-05": "Specific measurable environmental goal",
  "P9-05": "Local sourcing target percentage",
  "P13-03": "Planet KPI 1",
  "P13-04": "Planet KPI 2",
  "P2-07": "Target worker-owners by Year 3",
  "P7-06": "What surplus is for",
  "P13-05": "Profit KPI 1 (financial health)",
  "P13-06": "Profit KPI 2",
  "P7-07": "Democratic governance in practice",
  "P7-08": "Healthy participation threshold",
  "P11-03g": "ICA Principle 7 — Concern for community",
  "P13-07": "Ownership KPI 1 (governance health)",
  "P13-08": "Ownership KPI 2 (equity-building)",
  "P13-09": "How often four-bottom-line review runs",
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
      where: { coopId, fieldId: { in: SCORECARD_FIELDS } },
    });

    const fields: Record<string, string> = {};
    for (const e of entries) fields[e.fieldId] = e.value;

    const filledCount = Object.keys(fields).length;
    const coopName = fields["FM-01"] || "our co-op";

    const fieldSummary = SCORECARD_FIELDS
      .map((id) => `${FIELD_LABELS[id]} (${id}): ${fields[id] || "[not yet filled in]"}`)
      .join("\n");

    const prompt = `You are generating a Four Bottom Lines Scorecard for a worker-owned cooperative. This is a living document they will use every quarter to measure whether the co-op is on track across People, Planet, Profit, and Ownership.

Here is the information from their handbook:

${fieldSummary}

Return a JSON object with exactly these keys:

- "vision": One tight sentence summarizing what this co-op is building and why. Draw from P1-06 and FM-05.

- "reviewCadence": One sentence on how often they run this scorecard and who facilitates. From P13-09.

- "bottomLines": An array of exactly 4 objects in this order: People, Planet, Profit, Ownership. Each object has:
  - "name": "People", "Planet", "Profit", or "Ownership"
  - "commitment": 1–2 sentences on what this co-op is committed to in this bottom line. Draw from the relevant handbook fields.
  - "kpis": An array of 2–4 KPI objects, each with:
    - "label": Short name for this KPI (3–6 words)
    - "target": The specific measurable target (e.g. "100% at or above $18.50/hr", "80% participation in all votes")
    - "measure": How they track it (e.g. "Monthly payroll review", "Anonymous quarterly survey")
    - "trigger": What happens if they miss it — the response mechanism (1 sentence)

  People KPIs should come from: P7-01, P7-02, P7-03, P13-01, P13-02, P5-05
  Planet KPIs should come from: P7-04, P7-05, P9-05, P13-03, P13-04
  Profit KPIs should come from: P7-06, P13-05, P13-06, P2-07
  Ownership KPIs should come from: P7-07, P7-08, P13-07, P13-08, P11-03g

  If a KPI field is "[not yet filled in]", synthesize a reasonable target from adjacent fields and mark it with "(to be set)" in the target field.

Co-op name: ${coopName}

Return ONLY the JSON object. No explanation, no markdown, no code fences.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const scorecard = JSON.parse(cleaned);

    return NextResponse.json({ scorecard, coopName, fields: filledCount, total: SCORECARD_FIELDS.length });
  } catch (err) {
    console.error("GET /api/documents/scorecard error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
