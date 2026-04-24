import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ECO_FIELDS = [
  "FM-01", "FM-02", "FM-03",
  "P1-08",
  "P2-08", "P2-09",
  "P4-05", "P4-06",
  "P5-03",
  "P8-09",
  "P9-01", "P9-02", "P9-03", "P9-04", "P9-05", "P9-06",
  "P11-03f",
];

const FIELD_LABELS: Record<string, string> = {
  "FM-01": "Co-op name", "FM-02": "Tagline", "FM-03": "Geography served",
  "P1-08": "How this co-op connects to Project 2026 and the ecosystem",
  "P2-08": "Community supporters",
  "P2-09": "Co-op partner network",
  "P4-05": "Channel to reach future worker-owners",
  "P4-06": "How you connect through other co-ops",
  "P5-03": "How the co-op stays connected to the broader community",
  "P8-09": "Fledge ecosystem resources used",
  "P9-01": "Supplier partners (named organizations)",
  "P9-02": "Collaborator partners (complementary organizations)",
  "P9-03": "Community anchor partners (institutions)",
  "P9-04": "Co-op ecosystem partners (other co-ops)",
  "P9-05": "Local sourcing target",
  "P9-06": "Value-trapping strategy",
  "P11-03f": "ICA Principle 6 — Cooperation among cooperatives",
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
      where: { coopId, fieldId: { in: ECO_FIELDS } },
    });

    const fields: Record<string, string> = {};
    for (const e of entries) fields[e.fieldId] = e.value;

    const coopName = fields["FM-01"] || "our co-op";
    const fieldSummary = ECO_FIELDS
      .map((id) => `${FIELD_LABELS[id]} (${id}): ${fields[id] || "[not yet filled in]"}`)
      .join("\n");

    const prompt = `You are generating an Ecosystem Map for a worker-owned cooperative. This shows the co-op's place in its local economic ecosystem — who they work with, buy from, refer to, and build community with.

Handbook data:
${fieldSummary}

Return a JSON object with exactly these keys:

- "coopName": The co-op name (short version for the center label, max 20 chars)
- "tagline": The co-op tagline
- "geography": Where they operate (from FM-03, 1–3 words like "Lansing, MI")
- "valueTrap": One sentence on how this co-op keeps value circulating locally. From P9-06.
- "nodes": Array of ecosystem entities. Each node has:
  - "label": Short display name, max 22 characters (e.g. "Urbandale Farm", "Area Agency on Aging")
  - "type": One of: "coopNetwork" | "supplier" | "collaborator" | "anchor" | "fledge"
  - "relationship": One short phrase describing the connection (max 8 words, e.g. "food co-op — cross referrals")
  - "ring": 1, 2, or 3 based on type:
    - ring 1 (closest): "coopNetwork" — other co-ops they work with
    - ring 2: "supplier" and "collaborator" — partner organizations
    - ring 3 (furthest): "anchor" — community institutions, referral anchors
    - ring 3 also: "fledge" — The Fledge and Project 2026 infrastructure

Parse all named organizations from P9-01 through P9-04, P2-08, P2-09, and P8-09. Extract each individual named organization as a separate node. Assign type based on their role. Always include The Fledge as a "fledge" node if mentioned. Keep total nodes between 8 and 16 — surface the most important relationships. Trim less specific entries like "local credit union" to just "Local Credit Union".

Co-op: ${coopName}. Return ONLY the JSON object.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const map = JSON.parse(cleaned);

    return NextResponse.json({ map, coopName, fields: Object.keys(fields).length, total: ECO_FIELDS.length });
  } catch (err) {
    console.error("GET /api/documents/ecosystem-map error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
