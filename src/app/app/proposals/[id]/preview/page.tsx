import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProposalDoc from "@/components/ProposalDoc";

export default async function ProposalPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      org: true,
      contact: true,
      items: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!proposal) notFound();
  return <ProposalDoc proposal={proposal} />;
}
