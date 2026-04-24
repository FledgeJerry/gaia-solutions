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
  {
    id: "P1",
    title: "Part One: Our Founding Story",
    description: "People don't join businesses. They join movements. Tell them why this one matters. Work through these prompts as a group — write your answers down, argue about them a little. What comes out the other side is your real story.",
    fields: [
      {
        id: "P1-01",
        type: "N",
        feedsInto: ["Executive Summary", "Canvas", "Pitch"],
        question: "Who are we? Describe the founding group in human terms — where you come from, what you've lived, what connects you. Not job titles. Not résumés. Who are the people in this room?",
        example: "We are six home care workers from Lansing who have spent a combined 40 years caring for seniors and people with disabilities. We've all worked for agencies that paid us poverty wages while charging families high rates. We're tired of working hard and watching the money go somewhere else.",
        multiline: true,
      },
      {
        id: "P1-02",
        type: "N",
        feedsInto: ["Executive Summary", "Canvas", "Pitch", "Scorecard"],
        question: "What did we see that wasn't working? The specific problem or gap that led to this co-op. Be specific — generic problems get generic solutions.",
        example: "Home care agencies in Lansing pay caregivers $10–12/hour while charging families $28–35/hour. Workers have no benefits, no stability, no voice. Families get inconsistent care because workers keep leaving. Everyone loses except the agency owner.",
        multiline: true,
      },
      {
        id: "P1-03",
        type: "N",
        feedsInto: ["Executive Summary", "Canvas", "P&L", "Pitch"],
        question: "What are we building — and for whom? Plain language. No jargon. If you can't explain it to your neighbor in two sentences, keep working on it.",
        example: "We are building a worker-owned home care cooperative that employs caregivers as owner-members, pays living wages, and provides consistent, high-quality care to seniors and people with disabilities in Lansing.",
        multiline: true,
      },
      {
        id: "P1-04",
        type: "N",
        feedsInto: ["Executive Summary", "Canvas", "Pitch"],
        question: "Who do we serve? Describe your primary beneficiaries — your worker-owners, your customers, and your community.",
        example: "Our worker-owners: experienced caregivers who deserve ownership, living wages, and dignity. Our customers: seniors and adults with disabilities who need consistent, trustworthy in-home care. Our community: Lansing neighborhoods where we live and work.",
        multiline: true,
      },
      {
        id: "P1-05",
        type: "N",
        feedsInto: ["Executive Summary", "Canvas", "Governance Summary", "Pitch"],
        question: "Why a cooperative — and not just another business? What does shared ownership mean to your founding group specifically?",
        example: "Because we've been the workers. We know what it feels like when someone else owns your labor. A cooperative means we set our own wages, we make the decisions, and when the business does well — we do well. No one extracts from us.",
        multiline: true,
      },
      {
        id: "P1-06",
        type: "N",
        feedsInto: ["Executive Summary", "Canvas", "Scorecard", "Pitch"],
        question: "What does success look like in 10 years if everything goes right? Dare to dream out loud.",
        example: "In 10 years, Neighbors Care has 40 worker-owners all earning above the living wage with full benefits. We've helped start two more co-ops in Lansing. Our model has been replicated in three other Michigan cities. No caregiver in our network lives in poverty.",
        multiline: true,
      },
      {
        id: "P1-07",
        type: "N",
        feedsInto: ["Executive Summary", "Pitch"],
        question: "Write your 90-second story: the problem, your solution, and the invitation. Practice this out loud until a stranger can repeat it back to you.",
        example: "Home care in Lansing is broken. Caregivers earn poverty wages while agencies pocket the difference. Families get strangers who keep quitting. We're building Neighbors Care Cooperative — where the caregivers own the agency. We pay living wages, we hire for keeps, and every member has a vote. If you need care for someone you love, or you're a caregiver who's tired of being undervalued — we want to talk to you.",
        multiline: true,
      },
      {
        id: "P1-08",
        type: "N",
        feedsInto: ["Executive Summary", "Ecosystem Map", "Pitch"],
        question: "How does your co-op connect to the larger Project 2026 vision? How does it fit the ecosystem?",
        example: "Home care is one of the 10 basic needs Project 2026 is building cooperative solutions for. Neighbors Care is the healthcare node in Lansing's cooperative ecosystem — employing ALICE workers, serving ALICE households, and keeping value in the community instead of extracting it.",
        multiline: true,
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
