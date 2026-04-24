import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const GOV_FIELDS = [
  "FM-01", "FM-05", "FM-06", "FM-07",
  "P1-05",
  "P2-01", "P2-02", "P2-04", "P2-05", "P2-06",
  "P3-07",
  "P7-03", "P7-07", "P7-08",
  "P11-01", "P11-02",
  "P11-03", "P11-03b", "P11-03c", "P11-03d", "P11-03e", "P11-03f", "P11-03g",
  "P11-04", "P11-05", "P11-06", "P11-07", "P11-08", "P11-09", "P11-10", "P11-11", "P11-12",
  "P13-07", "P13-09",
];

const FIELD_LABELS: Record<string, string> = {
  "FM-01": "Co-op name",
  "FM-05": "Core values",
  "FM-06": "Ethical commitments",
  "FM-07": "Planned incorporation date",
  "P1-05": "Why a cooperative",
  "P2-01": "Number of founding members",
  "P2-02": "Founding members and what each brings",
  "P2-04": "How buy-in is paid",
  "P2-05": "Probationary period before full membership",
  "P2-06": "What new members learn during probation",
  "P3-07": "Accessibility commitments",
  "P7-03": "Maximum wage ratio",
  "P7-07": "Democratic governance in practice",
  "P7-08": "Healthy participation threshold",
  "P11-01": "State of incorporation",
  "P11-02": "Legal entity type",
  "P11-03": "ICA Principle 1 — Voluntary and Open Membership",
  "P11-03b": "ICA Principle 2 — Democratic Member Control",
  "P11-03c": "ICA Principle 3 — Member Economic Participation",
  "P11-03d": "ICA Principle 4 — Autonomy and Independence",
  "P11-03e": "ICA Principle 5 — Education, Training, and Information",
  "P11-03f": "ICA Principle 6 — Cooperation Among Cooperatives",
  "P11-03g": "ICA Principle 7 — Concern for Community",
  "P11-04": "Board composition and elections",
  "P11-05": "Number of board seats",
  "P11-06": "Decision-making structure",
  "P11-07": "Decisions requiring full member vote",
  "P11-08": "Decisions board makes independently",
  "P11-09": "Full membership meeting frequency and agenda",
  "P11-10": "Conflict resolution process",
  "P11-11": "Bylaws status",
  "P11-12": "Surplus distribution and patronage method",
  "P13-07": "Governance health KPI",
  "P13-09": "Four-bottom-line review frequency",
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
      where: { coopId, fieldId: { in: GOV_FIELDS } },
    });

    const fields: Record<string, string> = {};
    for (const e of entries) fields[e.fieldId] = e.value;

    const filledCount = Object.keys(fields).length;
    const coopName = fields["FM-01"] || "our co-op";

    const fieldSummary = GOV_FIELDS
      .map((id) => `${FIELD_LABELS[id]} (${id}): ${fields[id] || "[not yet filled in]"}`)
      .join("\n");

    const prompt = `You are writing a Governance Summary for a worker-owned cooperative. This document explains how the co-op is owned, governed, and held accountable — for grant applications, partnership conversations, and new member orientation.

Here is the information from their handbook:

${fieldSummary}

Return a JSON object with exactly these keys. Write in first person plural ("we", "our"). Professional but human — not corporate. 2–4 sentences per section unless otherwise noted. Skip or briefly note sections with "[not yet filled in]".

Keys:
- "legalStructure": The legal entity type, state of incorporation, planned date, and a sentence on why this structure fits a cooperative. Draw from P11-01, P11-02, FM-07.
- "foundingGroup": Who the founding members are, how many, and the cooperative reasoning behind shared ownership. From P2-01, P2-02, P1-05.
- "membershipPath": How someone becomes a full member-owner — buy-in, probationary period, and cooperative education. From P2-04, P2-05, P2-06.
- "boardGovernance": How the board is composed, elected, term lengths, and meeting cadence. From P11-04, P11-05.
- "decisionMaking": The tiered decision-making structure — what the board decides vs. what requires a full member vote. From P11-06, P11-07, P11-08.
- "memberMeetings": How often the full membership meets and what the standing agenda covers. From P11-09.
- "surplusDistribution": How patronage dividends work, how surplus is split between individual accounts and collective reserves. From P11-12.
- "workerStandards": Wage commitments, maximum wage ratio, and what democratic governance looks like day-to-day. From FM-05, FM-06, P7-03, P7-07.
- "accessibility": Commitments to inclusion across income levels, language, and ability. From P3-07.
- "conflictResolution": The step-by-step process for handling disputes between members. From P11-10.
- "bylawsStatus": Current status of bylaw drafting — what's done, in progress, not started. From P11-11.
- "icaPrinciples": An array of 7 objects, one per ICA principle, each with "number" (1–7), "name" (the principle name), and "text" (1–3 sentences on how this co-op embodies it). Draw from P11-03 through P11-03g. If a principle isn't filled in, write a brief aspirational statement.
- "accountability": How the co-op measures governance health — participation targets, four-bottom-line review cadence, and who is responsible. From P13-07, P13-09.

Co-op name: ${coopName}

Return ONLY the JSON object. No explanation, no markdown, no code fences.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const governance = JSON.parse(cleaned);

    return NextResponse.json({ governance, coopName, fields: filledCount, total: GOV_FIELDS.length });
  } catch (err) {
    console.error("GET /api/documents/governance error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
