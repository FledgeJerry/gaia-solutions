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
  {
    id: "P2",
    title: "Part Two: Building Your Ownership Community",
    description: "We're not looking for investors. We're looking for people who want to be part of something they actually own. In a worker-owned cooperative, ownership isn't something you add later. It's the point.",
    fields: [
      {
        id: "P2-01",
        type: "#",
        feedsInto: ["Executive Summary", "Equity Schedule", "Governance Summary", "Startup Budget"],
        question: "How many people are in your founding group? (This is the number of worker-owners starting this co-op together.)",
        example: "6 founding worker-owners",
        multiline: false,
      },
      {
        id: "P2-02",
        type: "N",
        feedsInto: ["Executive Summary", "Governance Summary"],
        question: "List your founding members and what each person brings to the co-op — skills, relationships, experience, lived knowledge.",
        example: "Maria (15 yrs caregiving, bilingual Spanish/English), James (10 yrs caregiving, CPR trainer), Daria (7 yrs caregiving, former union organizer), Keisha (12 yrs caregiving, client relations), Tom (8 yrs caregiving, van driver), Linda (20 yrs caregiving, mentor).",
        multiline: true,
      },
      {
        id: "P2-03",
        type: "#",
        feedsInto: ["Equity Schedule", "Startup Budget", "Cash Flow"],
        question: "What is the membership buy-in amount? (What does each worker pay to become a full member-owner? Should be accessible — not a barrier.)",
        example: "$500 per member, payable through $25/month payroll deduction over 20 months",
        multiline: false,
      },
      {
        id: "P2-04",
        type: "N",
        feedsInto: ["Equity Schedule", "Governance Summary"],
        question: "How will the buy-in be paid? (Lump sum, payroll deduction, labor contribution, other arrangement?)",
        example: "Payroll deduction of $25/month over 20 months. No one is excluded for inability to pay upfront.",
        multiline: true,
      },
      {
        id: "P2-05",
        type: "#",
        feedsInto: ["Governance Summary", "Equity Schedule"],
        question: "How long is the probationary period before a worker becomes a full voting member? (Typical range: 3–6 months.)",
        example: "4 months",
        multiline: false,
      },
      {
        id: "P2-06",
        type: "N",
        feedsInto: ["Governance Summary"],
        question: "What will new members learn during the probationary period and cooperative education program?",
        example: "ICA Seven Cooperative Principles, how our financials work (open book), how governance and voting work, what it means to be an owner not just an employee, Neighbors Care policies and values.",
        multiline: true,
      },
      {
        id: "P2-07",
        type: "#",
        feedsInto: ["Equity Schedule", "Executive Summary", "Scorecard"],
        question: "How many worker-owners do you aim to have by the end of Year 3?",
        example: "20 worker-owners",
        multiline: false,
      },
      {
        id: "P2-08",
        type: "N",
        feedsInto: ["Executive Summary", "Ecosystem Map", "Pitch"],
        question: "Who are the community supporters of your co-op? (People who believe in what you're building and want to support it — through purchases, referrals, advocacy.)",
        example: "Faith communities on Lansing's Eastside, Area Agency on Aging, CATA (transit), neighborhood associations, The Fledge community.",
        multiline: true,
      },
      {
        id: "P2-09",
        type: "N",
        feedsInto: ["Ecosystem Map", "Canvas"],
        question: "Which other co-ops or community organizations do you want to partner with? How does that connection trap value locally?",
        example: "Urbandale Farm (food co-op — we refer clients for food delivery), Sunshine House (housing co-op — shared members), local credit union for member savings accounts. Every dollar stays in Lansing.",
        multiline: true,
      },
      {
        id: "P2-10",
        type: "N",
        feedsInto: ["Pitch"],
        question: "Write your 90-second neighborhood conversation — someone at a community event asks what you're working on. You're not selling, you're inviting. Practice it out loud.",
        example: "We're starting a home care co-op where the caregivers own the business. We pay living wages, provide consistent care, and every worker has a vote. If you know someone who needs home care — or a caregiver tired of being undervalued — we'd love to talk.",
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
