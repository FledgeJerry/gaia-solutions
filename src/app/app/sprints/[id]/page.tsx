import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";
import ReflectionEditor from "./ReflectionEditor";

const STATUS_LABEL: Record<string, string> = {
  BACKLOG: "Backlog", SPRINT: "Sprint", IN_PROGRESS: "In Progress", REVIEW: "Review", DONE: "Done",
};
const STATUS_ORDER = ["BACKLOG", "SPRINT", "IN_PROGRESS", "REVIEW", "DONE"];

export default async function SprintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sprint = await prisma.sprint.findUnique({
    where: { id },
    include: { stories: { select: { id: true, title: true, status: true, points: true, type: true } } },
  });
  if (!sprint) notFound();

  const now = new Date();
  const isActive = sprint.startDate <= now && sprint.endDate >= now;

  const totalPoints = sprint.stories.reduce((sum, s) => sum + s.points, 0);
  const donePoints = sprint.stories.filter(s => s.status === "DONE").reduce((sum, s) => sum + s.points, 0);
  const pct = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  const byStatus = STATUS_ORDER.map(status => ({
    status,
    stories: sprint.stories.filter(s => s.status === status),
  }));

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 52px)" }}>
      <AppSidebar />

      <div style={{ padding: "1.5rem 2rem", maxWidth: "760px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div>
          <Link href="/app/sprints" style={{ ...mono, fontSize: "0.60rem", color: "#888", textDecoration: "none" }}>← Sprints</Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.5rem" }}>
            <h1 className="t-display-sm">Sprint {sprint.number}</h1>
            {isActive && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--gold)", display: "inline-block" }} title="Active" />}
          </div>
          {sprint.focus && <p style={{ fontSize: "0.9rem", color: "var(--ink)", marginTop: "0.25rem" }}>{sprint.focus}</p>}
          <p style={{ ...mono, fontSize: "0.68rem", color: "#aaa", marginTop: "0.25rem" }}>
            {sprint.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} → {sprint.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Metrics */}
        <div style={{ border: "1px solid var(--rule)", background: "var(--warm-white)", padding: "1.25rem" }}>
          <div style={{ display: "flex", gap: "2rem", marginBottom: "1rem" }}>
            <div>
              <p className="t-label">Stories</p>
              <p style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--ink)" }}>{sprint.stories.length}</p>
            </div>
            <div>
              <p className="t-label">Points done</p>
              <p style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--ink)" }}>{donePoints} / {totalPoints}</p>
            </div>
            <div>
              <p className="t-label">Completion</p>
              <p style={{ fontSize: "1.4rem", fontWeight: 600, color: pct === 100 ? "#2e7d32" : "var(--ink)" }}>{pct}%</p>
            </div>
          </div>

          <div style={{ height: "8px", background: "var(--rule)", borderRadius: "4px", overflow: "hidden", marginBottom: "1.25rem" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "var(--gold)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {byStatus.map(({ status, stories }) => {
              const points = stories.reduce((sum, s) => sum + s.points, 0);
              return (
                <div key={status} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#888", width: "100px", flexShrink: 0 }}>
                    {STATUS_LABEL[status]}
                  </span>
                  <span style={{ ...mono, fontSize: "0.72rem", color: "var(--ink)" }}>{stories.length} stor{stories.length === 1 ? "y" : "ies"}</span>
                  <span style={{ ...mono, fontSize: "0.68rem", color: "#aaa" }}>· {points}pt</span>
                </div>
              );
            })}
            {sprint.stories.length === 0 && (
              <p style={{ ...mono, fontSize: "0.72rem", color: "#aaa" }}>No stories assigned to this sprint yet.</p>
            )}
          </div>
        </div>

        {/* Story list */}
        {sprint.stories.length > 0 && (
          <div style={{ border: "1px solid var(--rule)", background: "var(--rule)" }}>
            {sprint.stories.map(s => (
              <div key={s.id} style={{ background: "var(--warm-white)", padding: "0.6rem 0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--ink)" }}>{s.title}</span>
                <span style={{ ...mono, fontSize: "0.62rem", color: "#888", flexShrink: 0 }}>{STATUS_LABEL[s.status]} · {s.points}pt</span>
              </div>
            ))}
          </div>
        )}

        {/* Reflection */}
        <ReflectionEditor sprintId={sprint.id} initialReflection={sprint.reflection} />
      </div>
    </div>
  );
}
