import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EQUITY_FIELDS = [
  "FM-01", "FM-02", "FM-07",
  "P2-01", "P2-03", "P2-04", "P2-05", "P2-07",
  "P7-02", "P7-03",
  "P11-03c", "P11-12", "P11-13", "P11-14",
  "P12-06", "P12-08", "P12-09", "P12-12",
  "P13-08",
];

const FIELD_LABELS: Record<string, string> = {
  "FM-01": "Co-op name",
  "FM-02": "Tagline",
  "FM-07": "Planned incorporation date",
  "P2-01": "Number of founding members",
  "P2-03": "Membership buy-in amount",
  "P2-04": "How buy-in is paid",
  "P2-05": "Probationary period length",
  "P2-07": "Target worker-owners by end of Year 3",
  "P7-02": "Living wage target (hourly)",
  "P7-03": "Maximum wage ratio",
  "P11-03c": "How members participate in co-op financial life",
  "P11-12": "Surplus distribution method (patronage)",
  "P11-13": "Percentage of surplus to member capital accounts",
  "P11-14": "Percentage of surplus to collective reserves",
  "P12-06": "Month 1 surplus or deficit",
  "P12-08": "Example: surplus to member accounts per month",
  "P12-09": "Example: surplus to collective reserves per month",
  "P12-12": "Year 1 total surplus or deficit",
  "P13-08": "Annual equity-building target per member",
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
      where: { coopId, fieldId: { in: EQUITY_FIELDS } },
    });

    const fields: Record<string, string> = {};
    for (const e of entries) fields[e.fieldId] = e.value;

    const filledCount = Object.keys(fields).length;
    const coopName = fields["FM-01"] || "our co-op";

    const fieldSummary = EQUITY_FIELDS
      .map((id) => `${FIELD_LABELS[id]} (${id}): ${fields[id] || "[not yet filled in]"}`)
      .join("\n");

    const prompt = `You are generating a Member Equity Schedule for a worker-owned cooperative. This document shows how each member's capital account grows over three years.

Here is the information from their handbook:

${fieldSummary}

Return a JSON object with exactly these keys:

- "narrative": A 2–3 sentence plain-language explanation of how member equity works at this specific co-op. Explain buy-in, patronage, and what owning equity actually means for a worker-owner here.

- "assumptions": An array of objects with "label" and "value" keys — the key financial and structural assumptions behind this schedule. Include at minimum: founding member count, Year 3 target, buy-in amount, patronage percentage, reserve percentage, living wage target. Use values from the handbook; if missing, use reasonable cooperative defaults and note them with "(assumed)".

- "memberSchedule": An array of 3 objects — one per year (Year 1, Year 2, Year 3) — each with:
  - "year": "Year 1", "Year 2", or "Year 3"
  - "memberCount": estimated member count that year (as a string, e.g. "6 founding members")
  - "newBuyIns": total new buy-in capital added that year (dollar amount as string)
  - "patronageDividends": total patronage allocated to member accounts that year (dollar amount as string)
  - "avgAccountGrowth": average per-member account growth that year (dollar amount as string)
  - "avgCumulativeAccount": average cumulative per-member account balance at end of year (dollar amount as string)
  - "note": one sentence about the key driver that year (e.g. "Deficit year — equity grows only through buy-in payments")

- "collectiveReserves": An array of 3 objects — one per year — each with:
  - "year": "Year 1", "Year 2", or "Year 3"
  - "addedToReserves": new collective reserves added that year (dollar amount as string)
  - "totalReserves": cumulative collective reserves at end of year (dollar amount as string)
  - "note": one sentence

- "patronageMethod": One sentence describing how patronage is allocated among members (hours-based, equally, etc.).

- "redemptionPolicy": One sentence about when and how members can redeem their equity (e.g., upon departure after X years).

- "equityPromise": 2 sentences — the human promise this schedule represents to founding members. What does building equity in a co-op mean for their lives?

Use numbers from the handbook wherever possible. If Year 1 is a deficit year (common for new co-ops), show $0 in patronage for Year 1 and explain why. Make Year 2 and Year 3 reflect realistic growth. All dollar amounts should be formatted as strings like "$1,200" or "$0".

Co-op name: ${coopName}

Return ONLY the JSON object. No explanation, no markdown, no code fences.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const schedule = JSON.parse(cleaned);

    return NextResponse.json({ schedule, coopName, fields: filledCount, total: EQUITY_FIELDS.length });
  } catch (err) {
    console.error("GET /api/documents/equity-schedule error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
