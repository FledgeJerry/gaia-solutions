import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AppSidebar from "@/components/AppSidebar";

const STATUS_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  DRAFT:    { label: "Draft",    bg: "#ECEAE4",           color: "var(--bark)" },
  SENT:     { label: "Sent",     bg: "var(--amber-bg)",   color: "var(--amber-dim)" },
  ACCEPTED: { label: "Accepted", bg: "var(--spore)",      color: "var(--fern)" },
  REJECTED: { label: "Rejected", bg: "#F5EBE0",           color: "var(--status-block)" },
  EXPIRED:  { label: "Expired",  bg: "var(--rule)",       color: "var(--clay)" },
};

export default async function ProposalsPage() {
  const proposals = await prisma.proposal.findMany({
    include: {
      org: { select: { name: true } },
      contact: { select: { name: true } },
      items: { select: { hours: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 52px)" }}>
      <AppSidebar />

      <div style={{ padding: "1.5rem 2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h1 className="t-display-sm">Proposals</h1>
            <p className="t-label" style={{ marginTop: "0.2rem" }}>{proposals.length} total</p>
          </div>
          <Link href="/app/proposals/new" className="btn btn-solid" style={{ padding: "0.5rem 1rem" }}>+ New proposal</Link>
        </div>

        {proposals.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", border: "1px solid var(--rule)", background: "var(--warm)" }}>
            <p className="t-body" style={{ marginBottom: "1rem" }}>No proposals yet.</p>
            <Link href="/app/proposals/new" className="btn btn-solid">Create your first proposal</Link>
          </div>
        ) : (
          <div style={{ border: "1px solid var(--rule)", background: "var(--rule)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 90px 100px 90px 50px", gap: "1px" }}>
              {["Proposal", "Client", "Status", "Total", "Updated", ""].map(h => (
                <div key={h} style={{ background: "#E8EDE4", padding: "0.5rem 0.75rem" }}>
                  <span className="t-label">{h}</span>
                </div>
              ))}
            </div>
            {proposals.map(p => {
              const totalHours = p.items.reduce((s, i) => s + i.hours, 0);
              const total = totalHours * p.ratePerHour;
              const st = STATUS_STYLES[p.status] ?? STATUS_STYLES.DRAFT;
              return (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 160px 90px 100px 90px 50px", gap: "1px", background: "var(--rule)" }}>
                  <div style={{ background: "var(--warm)", padding: "0.65rem 0.75rem" }}>
                    <p style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--soil)" }}>{p.title}</p>
                  </div>
                  <div style={{ background: "var(--warm)", padding: "0.65rem 0.75rem", display: "flex", alignItems: "center" }}>
                    <p style={{ ...mono, fontSize: "0.68rem", color: "var(--clay)" }}>{p.org?.name ?? p.contact?.name ?? "—"}</p>
                  </div>
                  <div style={{ background: "var(--warm)", padding: "0.65rem 0.75rem", display: "flex", alignItems: "center" }}>
                    <span style={{ ...mono, fontSize: "0.58rem", background: st.bg, color: st.color, padding: "0.15rem 0.4rem", borderRadius: "2px" }}>{st.label}</span>
                  </div>
                  <div style={{ background: "var(--warm)", padding: "0.65rem 0.75rem", display: "flex", alignItems: "center" }}>
                    <span style={{ ...mono, fontSize: "0.72rem", color: total > 0 ? "var(--soil)" : "var(--lichen)" }}>
                      {total > 0 ? `$${total.toLocaleString()}` : "—"}
                    </span>
                  </div>
                  <div style={{ background: "var(--warm)", padding: "0.65rem 0.75rem", display: "flex", alignItems: "center" }}>
                    <span style={{ ...mono, fontSize: "0.60rem", color: "var(--clay)" }}>
                      {p.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div style={{ background: "var(--warm)", padding: "0.65rem 0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Link href={`/app/proposals/${p.id}`} style={{ ...mono, fontSize: "0.60rem", color: "var(--sage)", textDecoration: "none" }}>→</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
