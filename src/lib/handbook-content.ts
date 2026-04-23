export type FieldType = "N" | "#";

export type HandbookField = {
  id: string;
  type: FieldType;
  feedsInto: string[];
  question: string;
  example: string;
  multiline?: boolean;
};

export type HandbookSection = {
  id: string;
  title: string;
  description: string;
  fields: HandbookField[];
};

export const HANDBOOK: HandbookSection[] = [
  {
    id: "FM",
    title: "Front Matter: Co-op Identity",
    description: "Lock in the basics before you dive into the full journey. These fields appear on every output document — they're the identity of your co-op.",
    fields: [
      {
        id: "FM-01",
        type: "N",
        feedsInto: ["All 10 output documents"],
        question: "What is the name of your cooperative?",
        example: "Neighbors Care Cooperative",
        multiline: false,
      },
      {
        id: "FM-02",
        type: "N",
        feedsInto: ["Executive Summary", "Canvas", "Pitch"],
        question: "Write your co-op's tagline — one sentence that captures what you do and why it matters.",
        example: "Worker-owned home care that keeps neighbors healthy, employed, and rooted in Lansing.",
        multiline: false,
      },
      {
        id: "FM-03",
        type: "N",
        feedsInto: ["Executive Summary", "Canvas", "Pitch", "Ecosystem Map"],
        question: "What city, neighborhood, or region do you primarily serve?",
        example: "Lansing, Michigan — primarily the Eastside and North Lansing neighborhoods.",
        multiline: false,
      },
      {
        id: "FM-04",
        type: "N",
        feedsInto: ["Executive Summary", "Canvas", "P&L", "Pitch"],
        question: "What industry or sector is your co-op in? (food, care, construction, tech, energy, etc.)",
        example: "Home care and personal assistance services.",
        multiline: false,
      },
      {
        id: "FM-05",
        type: "N",
        feedsInto: ["Executive Summary", "Canvas", "Governance Summary", "Scorecard", "Pitch"],
        question: "List your co-op's 3 to 5 core values — the non-negotiable principles that guide every decision.",
        example: "Dignity, democratic ownership, living wages, community rootedness, radical inclusion.",
        multiline: true,
      },
      {
        id: "FM-06",
        type: "N",
        feedsInto: ["Executive Summary", "Scorecard", "Governance Summary", "Pitch"],
        question: "State your specific ethical commitments — on wages, governance, environment, and community.",
        example: "We commit to paying every worker-owner at least $18/hour (Lansing living wage). We commit to one worker, one vote governance. We commit to sourcing locally wherever possible. We commit to reinvesting surplus into our members and our community.",
        multiline: true,
      },
      {
        id: "FM-07",
        type: "#",
        feedsInto: ["Executive Summary", "Governance Summary", "Equity Schedule"],
        question: "What month and year do you plan to formally incorporate?",
        example: "March 2026",
        multiline: false,
      },
    ],
  },
];

export function getSection(id: string): HandbookSection | undefined {
  return HANDBOOK.find((s) => s.id === id);
}

export function getAllFieldIds(): string[] {
  return HANDBOOK.flatMap((s) => s.fields.map((f) => f.id));
}
