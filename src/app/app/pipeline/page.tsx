import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AppSidebar from "@/components/AppSidebar";

function fmt$(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function deadlineDays(d: Date | null): number | null {
  if (!d) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

const PROPOSAL_STAGES: { status: string; label: string; color: string }[] = [
  { status: "DRAFT",    label: "Draft",    color: "#888" },
  { status: "SENT",     label: "Sent",     color: "var(--amber-dim)" },
  { status: "ACCEPTED", label: "Accepted", color: "var(--fern)" },
  { status: "REJECTED", label: "Rejected", color: "var(--status-block)" },
  { status: "EXPIRED",  label: "Expired",  color: "var(--clay)" },
];

const STORY_STAGES: { status: string; label: string; color: string }[] = [
  { status: "BACKLOG",     label: "Backlog",     color: "#888" },
  { status: "SPRINT",      label: "Sprint",      color: "#6BA3BE" },
  { status: "IN_PROGRESS", label: "In Progress", color: "var(--amber-dim)" },
  { status: "REVIEW",      label: "Review",      color: "var(--fern)" },
  { status: "DONE",        label: "Done",        color: "#888" },
];

export default async function PipelinePage() {
  const [proposals, stories] = await Promise.all([
    prisma.proposal.findMany({
      include: {
        org: { select: { id: true, name: true } },
        items: { select: { hours: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.story.findMany({
      where: { status: { not: "DONE" } },
      include: {
        org: { select: { id: true, name: true } },
        assignedTo: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  // ── Proposal buckets ───────────────────────────────────────────────────────
  type ProposalWithValue = typeof proposals[0] & { value: number };
  const proposalsWithValue: ProposalWithValue[] = proposals.map((p) => ({
    ...p,
    value: p.items.reduce((s, i) => s + i.hours, 0) * p.ratePerHour,
  }));

  const proposalBuckets = PROPOSAL_STAGES.map(({ status, label, color }) => {
    const items = proposalsWithValue.filter((p) => p.status === status);
    const total = items.reduce((s, p) => s + p.value, 0);
    return { status, label, color, count: items.length, total, items };
  });

  const pipelineValue = proposalBuckets.find((b) => b.status === "SENT")?.total ?? 0;
  const wonValue = proposalBuckets.find((b) => b.status === "ACCEPTED")?.total ?? 0;
  const sentCount = proposalBuckets.find((b) => b.status === "SENT")?.count ?? 0;

  // ── Story buckets ──────────────────────────────────────────────────────────
  const storyBuckets = STORY_STAGES.filter((s) => s.status !== "DONE").map(({ status, label, color }) => {
    const items = stories.filter((s) => s.status === status);
    const blocked = items.filter((s) => s.blocked).length;
    return { status, label, color, count: items.length, blocked, items };
  });

  const activeCount = stories.filter((s) => s.status === "IN_PROGRESS").length;
  const blockedCount = stories.filter((s) => s.blocked).length;

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  const label: React.CSSProperties = { ...mono, fontSize: "0.60rem", letterSpacing: "0.10em", textTransform: "uppercase" as const, color: "#888" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 52px)" }}>
      <AppSidebar />

      <div style={{ padding: "1.5rem 2rem", display: "flex", flexDirection: "column", gap: "1.75rem" }}>

        <div>
          <h1 className="t-display-sm">Pipeline</h1>
          <p style={{ ...mono, fontSize: "0.68rem", color: "#888", marginTop: "0.2rem" }}>Proposals + active work</p>
        </div>

        {/* Summary row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
          {[
            { label: "Pipeline value", value: fmt$(pipelineValue), sub: `${sentCount} sent` },
            { label: "Won value", value: fmt$(wonValue), sub: "accepted" },
            { label: "Active stories", value: String(activeCount), sub: "in progress" },
            { label: "Blocked", value: String(blockedCount), sub: "need attention", alert: blockedCount > 0 },
          ].map(({ label: lbl, value, sub, alert }) => (
            <div key={lbl} style={{ background: "var(--warm-white)", border: `1px solid ${alert ? "var(--status-block)" : "var(--rule)"}`, padding: "0.85rem 1rem" }}>
              <p style={{ ...label, marginBottom: "0.25rem" }}>{lbl}</p>
              <p style={{ ...mono, fontSize: "1.5rem", fontWeight: 700, color: alert ? "var(--status-block)" : "var(--soil)", margin: "0 0 0.1rem" }}>{value}</p>
              <p style={{ ...mono, fontSize: "0.62rem", color: "#aaa" }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Two columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.75rem", alignItems: "start" }}>

          {/* Proposal pipeline */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.85rem" }}>
              <p style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "#555" }}>Proposal Pipeline</p>
              <Link href="/app/proposals/new" style={{ ...mono, fontSize: "0.62rem", color: "var(--moss)", textDecoration: "none" }}>+ New</Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {proposalBuckets.map(({ status, label: stageLabel, color, count, total, items }) => {
                if (count === 0 && (status === "REJECTED" || status === "EXPIRED")) return null;
                return (
                  <div key={status} style={{ border: "1px solid var(--rule)", background: "var(--warm-white)" }}>
                    {/* Stage header */}
                    <div style={{ padding: "0.55rem 0.85rem", borderBottom: count > 0 ? "1px solid var(--rule)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
                        <span style={{ ...mono, fontSize: "0.68rem", color: "#555" }}>{stageLabel}</span>
                      </div>
                      <div style={{ display: "flex", gap: "1rem" }}>
                        <span style={{ ...mono, fontSize: "0.65rem", color: "#aaa" }}>{count} proposal{count !== 1 ? "s" : ""}</span>
                        {total > 0 && <span style={{ ...mono, fontSize: "0.65rem", color, fontWeight: 600 }}>{fmt$(total)}</span>}
                      </div>
                    </div>

                    {/* Proposal rows */}
                    {items.map((p, i) => {
                      const days = deadlineDays(p.expiresAt);
                      const expiring = days !== null && days >= 0 && days <= 7;
                      return (
                        <div key={p.id} style={{ padding: "0.55rem 0.85rem", borderBottom: i < items.length - 1 ? "1px solid var(--rule)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ minWidth: 0 }}>
                            <Link href={`/app/proposals/${p.id}`} style={{ fontSize: "0.82rem", color: "var(--soil)", textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {p.title}
                            </Link>
                            <p style={{ ...mono, fontSize: "0.60rem", color: "#aaa", marginTop: "0.15rem" }}>
                              {p.org?.name ?? "—"}
                              {p.sentAt && ` · sent ${fmtDate(p.sentAt)}`}
                            </p>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.15rem", flexShrink: 0 }}>
                            <span style={{ ...mono, fontSize: "0.68rem", color: "var(--bark)" }}>{fmt$(p.value)}</span>
                            {expiring && (
                              <span style={{ ...mono, fontSize: "0.58rem", color: "var(--status-block)" }}>
                                {days === 0 ? "expires today" : `${days}d left`}
                              </span>
                            )}
                            {days !== null && days < 0 && status === "SENT" && (
                              <span style={{ ...mono, fontSize: "0.58rem", color: "var(--clay)" }}>expired</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Work pipeline */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.85rem" }}>
              <p style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "#555" }}>Work Pipeline</p>
              <Link href="/app/board" style={{ ...mono, fontSize: "0.62rem", color: "var(--moss)", textDecoration: "none" }}>Board →</Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {storyBuckets.map(({ status, label: stageLabel, color, count, blocked, items }) => (
                <div key={status} style={{ border: "1px solid var(--rule)", background: "var(--warm-white)" }}>
                  {/* Stage header */}
                  <div style={{ padding: "0.55rem 0.85rem", borderBottom: count > 0 ? "1px solid var(--rule)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
                      <span style={{ ...mono, fontSize: "0.68rem", color: "#555" }}>{stageLabel}</span>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      {blocked > 0 && (
                        <span style={{ ...mono, fontSize: "0.60rem", color: "var(--status-block)", background: "#FDF0EC", padding: "0.1rem 0.35rem" }}>
                          {blocked} blocked
                        </span>
                      )}
                      <span style={{ ...mono, fontSize: "0.65rem", color: "#aaa" }}>{count}</span>
                    </div>
                  </div>

                  {/* Story rows — show top 5 */}
                  {items.slice(0, 5).map((s, i) => (
                    <div key={s.id} style={{ padding: "0.5rem 0.85rem", borderBottom: i < Math.min(items.length, 5) - 1 ? "1px solid var(--rule)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
                        {s.blocked && <span style={{ ...mono, fontSize: "0.58rem", color: "var(--status-block)", flexShrink: 0 }}>⚠</span>}
                        <Link href="/app/board" style={{ fontSize: "0.8rem", color: "var(--soil)", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.title}
                        </Link>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
                        {s.org && <span style={{ ...mono, fontSize: "0.60rem", color: "#aaa" }}>{s.org.name}</span>}
                        {s.assignedTo && <span style={{ ...mono, fontSize: "0.60rem", color: "#888" }}>{s.assignedTo.name?.split(" ")[0]}</span>}
                      </div>
                    </div>
                  ))}
                  {items.length > 5 && (
                    <div style={{ padding: "0.4rem 0.85rem" }}>
                      <Link href="/app/board" style={{ ...mono, fontSize: "0.62rem", color: "#aaa", textDecoration: "none" }}>
                        +{items.length - 5} more on board →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
