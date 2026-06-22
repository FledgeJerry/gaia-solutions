import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AppSidebar from "@/components/AppSidebar";
import DeleteSprintButton from "./DeleteSprintButton";

export default async function SprintsPage() {
  const sprints = await prisma.sprint.findMany({
    include: { _count: { select: { stories: true } } },
    orderBy: { number: "desc" },
  });

  const now = new Date();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 52px)" }}>
      <AppSidebar />

      <div style={{ padding: "1.5rem 2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h1 className="t-display-sm">Sprints</h1>
            <p className="t-label" style={{ marginTop: "0.2rem" }}>{sprints.length} total</p>
          </div>
          <Link href="/app/sprints/new" className="btn btn-solid" style={{ padding: "0.5rem 1rem" }}>+ New sprint</Link>
        </div>

        {sprints.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", border: "1px solid var(--rule)", background: "var(--warm-white)" }}>
            <p className="t-body" style={{ color: "#888", marginBottom: "1rem" }}>No sprints yet.</p>
            <Link href="/app/sprints/new" className="btn btn-solid">Create your first sprint</Link>
          </div>
        ) : (
          <div style={{ border: "1px solid var(--rule)", background: "var(--rule)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 140px 140px 70px 70px 60px", gap: "1px" }}>
              <div style={{ background: "#ECEAE4", padding: "0.5rem 0.75rem" }}><span className="t-label">#</span></div>
              <div style={{ background: "#ECEAE4", padding: "0.5rem 0.75rem" }}><span className="t-label">Focus</span></div>
              <div style={{ background: "#ECEAE4", padding: "0.5rem 0.75rem" }}><span className="t-label">Start</span></div>
              <div style={{ background: "#ECEAE4", padding: "0.5rem 0.75rem" }}><span className="t-label">End</span></div>
              <div style={{ background: "#ECEAE4", padding: "0.5rem 0.75rem" }}><span className="t-label">Stories</span></div>
              <div style={{ background: "#ECEAE4", padding: "0.5rem 0.75rem" }}><span className="t-label">Points</span></div>
              <div style={{ background: "#ECEAE4", padding: "0.5rem 0.75rem" }} />
            </div>
            {sprints.map(sprint => {
              const isActive = sprint.startDate <= now && sprint.endDate >= now;
              return (
                <div key={sprint.id} style={{ display: "grid", gridTemplateColumns: "70px 1fr 140px 140px 70px 70px 60px", gap: "1px", background: "var(--rule)" }}>
                  <div style={{ background: "var(--warm-white)", padding: "0.65rem 0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ink)" }}>{sprint.number}</span>
                    {isActive && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--gold)", display: "inline-block" }} title="Active" />}
                  </div>
                  <div style={{ background: "var(--warm-white)", padding: "0.65rem 0.75rem", display: "flex", alignItems: "center" }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--ink)" }}>{sprint.focus ?? "—"}</span>
                  </div>
                  <div style={{ background: "var(--warm-white)", padding: "0.65rem 0.75rem", display: "flex", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "#666" }}>{sprint.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div style={{ background: "var(--warm-white)", padding: "0.65rem 0.75rem", display: "flex", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "#666" }}>{sprint.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div style={{ background: "var(--warm-white)", padding: "0.65rem 0.75rem", display: "flex", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "#666" }}>{sprint._count.stories}</span>
                  </div>
                  <div style={{ background: "var(--warm-white)", padding: "0.65rem 0.75rem", display: "flex", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "#666" }}>{sprint.totalPoints || ""}</span>
                  </div>
                  <div style={{ background: "var(--warm-white)", padding: "0.65rem 0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <DeleteSprintButton id={sprint.id} number={sprint.number} storyCount={sprint._count.stories} />
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
