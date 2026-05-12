import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import AppSidebar from "@/components/AppSidebar";
import ProposalWorkspace from "./ProposalWorkspace";

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [proposal, orgs, contacts] = await Promise.all([
    prisma.proposal.findUnique({
      where: { id },
      include: {
        org: true,
        contact: true,
        items: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      },
    }),
    prisma.org.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.contact.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!proposal) notFound();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 52px)" }}>
      <AppSidebar />
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ padding: "0.75rem 2rem", borderBottom: "1px solid var(--rule)", display: "flex", alignItems: "center", gap: "1rem", background: "var(--warm)", flexShrink: 0 }}>
          <Link href="/app/proposals" style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", color: "var(--sage)", textDecoration: "none" }}>← Proposals</Link>
          <span style={{ color: "var(--rule-heavy)" }}>|</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--bark)", fontWeight: 500 }}>{proposal.title}</span>
        </div>
        <ProposalWorkspace proposal={proposal} orgs={orgs} contacts={contacts} />
      </div>
    </div>
  );
}
