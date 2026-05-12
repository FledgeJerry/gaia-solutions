import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProposalDoc from "@/components/ProposalDoc";

export default async function PublicProposalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const proposal = await prisma.proposal.findUnique({
    where: { shareToken: token },
    include: {
      org: true,
      contact: true,
      items: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!proposal) notFound();
  return <ProposalDoc proposal={proposal} />;
}
