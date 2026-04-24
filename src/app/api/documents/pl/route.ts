import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PL_FIELDS = [
  "FM-01", "FM-04",
  "P10-01", "P10-02", "P10-03", "P10-04", "P10-05", "P10-06", "P10-07", "P10-08", "P10-09",
  "P11-13", "P11-14",
  "P12-07", "P12-10", "P12-11", "P12-12",
  "P7-06",
];

const FIELD_LABELS: Record<string, string> = {
  "FM-01": "Co-op name", "FM-04": "Industry/sector",
  "P10-01": "Products and services", "P10-02": "Pricing per unit",
  "P10-03": "Cost to deliver per unit", "P10-04": "Projected units per month (Year 1 ramp)",
  "P10-05": "Projected monthly revenue Year 1", "P10-06": "Projected monthly revenue Year 2",
  "P10-07": "Projected monthly revenue Year 3",
  "P10-08": "Total monthly labor cost", "P10-09": "Other monthly operating costs",
  "P11-13": "% surplus to member capital accounts", "P11-14": "% surplus to collective reserves",
  "P12-07": "Break-even month", "P12-10": "Total Year 1 revenue",
  "P12-11": "Total Year 1 expenses", "P12-12": "Year 1 surplus or deficit",
  "P7-06": "What surplus is for",
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
      where: { coopId, fieldId: { in: PL_FIELDS } },
    });

    const fields: Record<string, string> = {};
    for (const e of entries) fields[e.fieldId] = e.value;

    const coopName = fields["FM-01"] || "our co-op";
    const fieldSummary = PL_FIELDS
      .map((id) => `${FIELD_LABELS[id]} (${id}): ${fields[id] || "[not yet filled in]"}`)
      .join("\n");

    const prompt = `You are generating a Profit & Loss Statement for Years 1, 2, and 3 of a worker-owned cooperative.

Handbook data:
${fieldSummary}

Return a JSON object with exactly these keys:

- "breakEvenMonth": The projected break-even month (e.g. "Month 5"). From P12-07.
- "surplusNote": One sentence on what surplus means at this co-op. From P7-06.
- "years": Array of 3 objects (Year 1, Year 2, Year 3), each with:
  - "year": "Year 1", "Year 2", "Year 3"
  - "revenue": Total annual revenue as formatted string (e.g. "$115,200")
  - "laborCost": Total annual labor cost
  - "operatingCost": Total annual non-labor operating costs
  - "totalCost": Labor + operating combined
  - "surplusDeficit": Revenue minus total cost — prefix deficit with a minus sign (e.g. "($22,080)" or "$14,400")
  - "isDeficit": true if negative, false if positive
  - "toMemberAccounts": Surplus allocated to member capital accounts (or "$0" if deficit)
  - "toReserves": Surplus allocated to collective reserves (or "$0" if deficit)
  - "toCommunity": Remainder allocated to community benefit (or "$0" if deficit)
  - "note": One sentence explaining this year's financial story

Use Year 1 totals directly from P12-10, P12-11, P12-12. For Year 2, multiply P10-06 monthly revenue × 12 and estimate costs proportionally. For Year 3, use P10-07 × 12. Apply P11-13 and P11-14 percentages to any surplus for the distribution rows. If fields are "[not yet filled in]", make reasonable projections based on what is available and note "(projected)" in the value.

Co-op: ${coopName}. Return ONLY the JSON object.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const pl = JSON.parse(cleaned);

    return NextResponse.json({ pl, coopName, fields: Object.keys(fields).length, total: PL_FIELDS.length });
  } catch (err) {
    console.error("GET /api/documents/pl error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
