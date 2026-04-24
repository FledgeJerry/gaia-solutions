import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CANVAS_FIELDS = [
  "FM-01", "FM-02", "FM-03", "FM-04", "FM-05",
  "P1-03", "P1-04", "P1-05",
  "P3-04",
  "P4-01", "P4-02", "P4-03",
  "P2-08", "P2-09",
  "P9-01", "P9-02", "P9-03", "P9-04",
  "P10-01",
  "P8-08",
  "P8-01", "P8-02", "P8-03", "P8-05", "P8-06",
  "P10-02", "P11-13", "P11-14",
];

const FIELD_LABELS: Record<string, string> = {
  "FM-01": "Co-op name",
  "FM-02": "Tagline",
  "FM-03": "Geography served",
  "FM-04": "Industry/sector",
  "FM-05": "Core values",
  "P1-03": "What we're building",
  "P1-04": "Who we serve",
  "P1-05": "Why a cooperative",
  "P3-04": "Value proposition",
  "P4-01": "Primary channel",
  "P4-02": "Second channel",
  "P4-03": "Third channel",
  "P2-08": "Community supporters",
  "P2-09": "Co-op partner network",
  "P9-01": "Supplier partners",
  "P9-02": "Collaborator partners",
  "P9-03": "Anchor community partners",
  "P9-04": "Co-op ecosystem partners",
  "P10-01": "Products and services",
  "P8-08": "Resources in hand",
  "P8-01": "Equipment costs",
  "P8-02": "Space and facility",
  "P8-03": "Starting inventory",
  "P8-05": "Technology and software",
  "P8-06": "Insurance",
  "P10-02": "Pricing",
  "P11-13": "Member capital account allocation",
  "P11-14": "Collective reserve allocation",
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
      where: { coopId, fieldId: { in: CANVAS_FIELDS } },
    });

    const fields: Record<string, string> = {};
    for (const e of entries) fields[e.fieldId] = e.value;

    const filledCount = Object.keys(fields).length;
    const coopName = fields["FM-01"] || "our co-op";

    const fieldSummary = CANVAS_FIELDS
      .map((id) => `${FIELD_LABELS[id]} (${id}): ${fields[id] || "[not yet filled in]"}`)
      .join("\n");

    const prompt = `You are generating a Business Model Canvas for a worker-owned cooperative.

Here is the information from their handbook:

${fieldSummary}

Return a JSON object with exactly these 9 keys. Each key maps to an array of 3–5 short bullet point strings (plain text, no markdown, no dashes — just the text). Each bullet should be one tight sentence or phrase.

Keys and what to put in each:
- "keyPartners": The specific supplier partners, collaborator organizations, anchor community institutions, and co-op ecosystem partners. Draw from the partner fields.
- "keyActivities": The core things this co-op does to deliver value — derived from the products/services list and what they're building. Be specific.
- "keyResources": What they already have and what they need — skills, relationships, tools, technology, licenses. Be concrete.
- "valueProposition": The central offer — what makes this co-op different, and why shared ownership changes the equation. Lead with the tagline if available.
- "ownershipCommunity": How this co-op engages and builds with its community — supporters, community partners, co-op network relationships. This is "Customer Relationships" re-imagined for cooperative ownership.
- "channels": How the co-op reaches its customers and potential members. Draw directly from the channel fields.
- "memberSegments": Who this co-op serves — both the worker-owners and the customers/community. This is "Customer Segments" adapted for co-ops where workers are owners.
- "costStructure": The main cost categories — equipment, space, technology, insurance, labor. Be specific but concise.
- "revenueAndSurplus": Revenue streams plus how surplus is distributed — patronage dividends, collective reserves, community benefit. This is "Revenue Streams" expanded for cooperative economics.

If a section has limited data, synthesize from adjacent fields rather than leaving it empty.
Co-op name: ${coopName}

Return ONLY the JSON object. No explanation, no markdown, no code fences.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const canvas = JSON.parse(cleaned);

    return NextResponse.json({ canvas, coopName, fields: filledCount, total: CANVAS_FIELDS.length });
  } catch (err) {
    console.error("GET /api/documents/canvas error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
