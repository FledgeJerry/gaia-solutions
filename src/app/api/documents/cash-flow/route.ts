import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CF_FIELDS = [
  "FM-01",
  "P8-10", "P8-11",
  "P10-02", "P10-04", "P10-05", "P10-08", "P10-09",
  "P12-01", "P12-02", "P12-03", "P12-04", "P12-05", "P12-06", "P12-07", "P12-08", "P12-09",
];

const FIELD_LABELS: Record<string, string> = {
  "FM-01": "Co-op name",
  "P8-10": "Total startup capital (opening balance)",
  "P8-11": "Funding plan",
  "P10-02": "Pricing per unit",
  "P10-04": "Volume ramp-up schedule (Year 1)",
  "P10-05": "Monthly revenue projection Year 1",
  "P10-08": "Monthly labor cost",
  "P10-09": "Other monthly operating costs",
  "P12-01": "Month 1 revenue",
  "P12-02": "Month 1 wages",
  "P12-03": "Month 1 space costs",
  "P12-04": "Month 1 supplies",
  "P12-05": "Month 1 other costs",
  "P12-06": "Month 1 net (surplus or deficit)",
  "P12-07": "Projected break-even month",
  "P12-08": "Surplus distribution to member accounts",
  "P12-09": "Surplus to collective reserves",
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
      where: { coopId, fieldId: { in: CF_FIELDS } },
    });

    const fields: Record<string, string> = {};
    for (const e of entries) fields[e.fieldId] = e.value;

    const coopName = fields["FM-01"] || "our co-op";
    const fieldSummary = CF_FIELDS
      .map((id) => `${FIELD_LABELS[id]} (${id}): ${fields[id] || "[not yet filled in]"}`)
      .join("\n");

    const prompt = `You are generating a Month-by-Month Cash Flow Statement for Year 1 of a worker-owned cooperative.

Handbook data:
${fieldSummary}

Return a JSON object with exactly these keys:

- "openingBalance": The startup capital available at the start of Month 1. From P8-10. Format as "$25,100".
- "breakEvenMonth": Which month revenue first covers all costs. From P12-07.
- "months": Array of exactly 12 objects, one per month. Each with:
  - "month": "Month 1" through "Month 12"
  - "revenue": Money coming in that month (formatted string)
  - "wages": Labor costs (formatted string)
  - "otherCosts": All non-labor costs (formatted string)
  - "totalOut": Wages + otherCosts (formatted string)
  - "netFlow": Revenue minus totalOut — negative means deficit (formatted, use parentheses for negative e.g. "($3,200)")
  - "closingBalance": Running balance at end of month (formatted string)
  - "isDeficit": true if netFlow is negative

  Use Month 1 actual figures from P12-01 through P12-06. For the ramp-up across months, use P10-04 (volume ramp) and P10-05 (revenue projection) to interpolate months 2–12 realistically. Costs should stabilize once ramp-up ends. After break-even, show positive net flows.

- "summary": 2 sentences summarizing the Year 1 cash story — when the burn happens, when break-even hits, and what the closing balance looks like.

All dollar amounts as formatted strings. Closing balance must chain correctly (each month's closing = previous closing + net flow). Starting balance is the opening balance.

Co-op: ${coopName}. Return ONLY the JSON object.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const cashFlow = JSON.parse(cleaned);

    return NextResponse.json({ cashFlow, coopName, fields: Object.keys(fields).length, total: CF_FIELDS.length });
  } catch (err) {
    console.error("GET /api/documents/cash-flow error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
