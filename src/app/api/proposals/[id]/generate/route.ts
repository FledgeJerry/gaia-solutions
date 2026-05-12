import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env["GEMINI_API_KEY"] ?? "");

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      org: true,
      contact: true,
      items: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const totalHours = proposal.items.reduce((s, i) => s + i.hours, 0);
  const totalCost = totalHours * proposal.ratePerHour;

  const itemsText = proposal.items.map(item =>
    `- ${item.title}${item.description ? `: ${item.description}` : ""} — ${item.hours} hrs ($${(item.hours * proposal.ratePerHour).toLocaleString()})`
  ).join("\n");

  const prompt = `You are writing on behalf of gaia.solutions, a worker-owned software cooperative based in Lansing, MI. We build tools that hold up — civic tech, management systems, data platforms, and cooperative infrastructure.

Write a professional proposal cover letter with the following details:

Client: ${proposal.org?.name ?? "the client"}${proposal.contact ? ` / ${proposal.contact.name}` : ""}
Project title: ${proposal.title}
Project description: ${proposal.projectDesc ?? "(no description provided)"}

Scope of work:
${itemsText || "(no line items yet)"}

Total estimated investment: ${totalHours} hours at $${proposal.ratePerHour}/hr = $${totalCost.toLocaleString()}

Write 3–4 paragraphs:
1. Open with genuine interest in the project and a brief mention that gaia.solutions is a worker-owned co-op — make this feel human, not corporate.
2. Summarize your understanding of what they need and what success looks like.
3. Briefly explain the approach and why this scope covers it.
4. Close with a clear next step (review the estimate, schedule a call, sign off) and express enthusiasm.

Tone: warm, direct, confident. No jargon. No bullet points. Plain prose only. Do not include a date, address header, or signature block — those will be added separately.`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await model.generateContentStream(prompt);
        let full = "";
        for await (const chunk of result.stream) {
          const text = chunk.text();
          full += text;
          controller.enqueue(encoder.encode(text));
        }
        // Save to DB after streaming completes
        await prisma.proposal.update({
          where: { id },
          data: { coverLetter: full },
        });
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" },
  });
}
