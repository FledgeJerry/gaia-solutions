import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BUDGET_FIELDS = [
  "FM-01",
  "P2-01", "P2-03",
  "P8-01", "P8-02", "P8-03", "P8-04", "P8-05", "P8-06", "P8-07", "P8-08", "P8-10", "P8-11",
  "P4-04", "P6-05",
];

const FIELD_LABELS: Record<string, string> = {
  "FM-01": "Co-op name",
  "P2-01": "Number of founding members",
  "P2-03": "Membership buy-in amount",
  "P8-01": "Equipment and technology costs",
  "P8-02": "Space and facility costs",
  "P8-03": "Starting inventory and supplies",
  "P8-04": "Legal and incorporation costs",
  "P8-05": "Technology and software (first year)",
  "P8-06": "Insurance costs",
  "P8-07": "Contingency and emergency reserve",
  "P8-08": "Resources already in hand (reduces startup costs)",
  "P8-10": "Total startup capital needed",
  "P8-11": "Funding plan (sources and amounts)",
  "P4-04": "Monthly channel/marketing costs",
  "P6-05": "Monthly marketing/communications budget",
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
      where: { coopId, fieldId: { in: BUDGET_FIELDS } },
    });

    const fields: Record<string, string> = {};
    for (const e of entries) fields[e.fieldId] = e.value;

    const coopName = fields["FM-01"] || "our co-op";
    const fieldSummary = BUDGET_FIELDS
      .map((id) => `${FIELD_LABELS[id]} (${id}): ${fields[id] || "[not yet filled in]"}`)
      .join("\n");

    const prompt = `You are generating a Startup Budget for a worker-owned cooperative — an itemized list of everything needed before opening day.

Handbook data:
${fieldSummary}

Return a JSON object with exactly these keys:

- "costItems": Array of cost line items, each with:
  - "category": Category name (e.g. "Equipment & Technology", "Legal & Incorporation", "Space & Facility", "Starting Inventory", "Insurance", "Marketing & Channels", "Contingency Reserve")
  - "item": Specific description of this cost
  - "amount": Dollar amount as formatted string (e.g. "$3,200")
  - "note": Brief note — whether it's one-time or recurring, or if already in hand

- "totalNeeded": Sum of all cost items as formatted string

- "fundingSources": Array from P8-11, each with:
  - "source": Name of funding source (e.g. "Member buy-ins", "CDFI loan", "Grant")
  - "amount": Dollar amount as formatted string

- "totalFunded": Sum of funding sources
- "gap": Difference between totalNeeded and totalFunded (formatted, show "$0" if fully covered, show deficit if not)
- "inHandNote": One sentence about what the founding group already has that reduces startup needs. From P8-08.

Parse dollar amounts from the handbook text. Group related items under clear categories. If a field is "[not yet filled in]", omit that line item or use a reasonable placeholder marked "(to be determined)". Member buy-ins = P2-01 founders × P2-03 buy-in amount.

Co-op: ${coopName}. Return ONLY the JSON object.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const budget = JSON.parse(cleaned);

    return NextResponse.json({ budget, coopName, fields: Object.keys(fields).length, total: BUDGET_FIELDS.length });
  } catch (err) {
    console.error("GET /api/documents/startup-budget error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
