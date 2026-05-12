import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AppSidebar from "@/components/AppSidebar";
import BoardKanban from "./BoardKanban";

export default async function BoardPage() {
  const [stories, sprints] = await Promise.all([
    prisma.story.findMany({
      include: {
        contact: { select: { id: true, name: true } },
        org: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.sprint.findMany({ orderBy: { number: "desc" }, take: 5 }),
  ]);

  const activeSprint = sprints.find(s => {
    const now = new Date();
    return s.startDate <= now && s.endDate >= now;
  }) ?? sprints[0] ?? null;

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 52px)" }}>
      <AppSidebar />

      <div style={{ padding: "1.5rem 2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="t-display-sm">Board</h1>
            <p className="t-label" style={{ marginTop: "0.2rem" }}>{stories.length} stories</p>
          </div>
          <Link href="/app/board/new" className="btn btn-solid" style={{ padding: "0.5rem 1rem" }}>+ Add story</Link>
        </div>

        {/* Sprint bar */}
        {activeSprint && (
          <div style={{ padding: "0.75rem 1.25rem", border: "1px solid var(--rule)", background: "var(--warm-white)", display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <span style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "#888" }}>Sprint {activeSprint.number}</span>
            {activeSprint.focus && <span style={{ fontSize: "0.82rem", color: "var(--ink)", fontWeight: 500 }}>{activeSprint.focus}</span>}
            <span style={{ ...mono, fontSize: "0.62rem", color: "#aaa", marginLeft: "auto" }}>
              {activeSprint.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} → {activeSprint.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        )}

        {/* Kanban */}
        <BoardKanban stories={stories} />
      </div>
    </div>
  );
}
