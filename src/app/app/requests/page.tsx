"use client";

import { useEffect, useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import Link from "next/link";

type Request = {
  id: string; title: string; description: string | null; status: string; createdAt: string;
  source: string | null; submitterEmail: string | null;
  org: { id: string; name: string } | null;
  submittedBy: { id: string; name: string | null; email: string } | null;
  convertedTo: { id: string; title: string; status: string } | null;
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "var(--amber)", REVIEWED: "#6BA3BE", CONVERTED: "var(--moss)", DECLINED: "var(--clay)",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending", REVIEWED: "Reviewed", CONVERTED: "On board", DECLINED: "Declined",
};
const STORY_TYPES = ["CLIENT", "PARTNER", "INTERNAL", "INVESTIGATION"] as const;

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"PENDING" | "ALL">("PENDING");
  const [promoting, setPromoting] = useState<string | null>(null);
  const [storyType, setStoryType] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/requests").then(r => r.json()).then(data => {
      setRequests(Array.isArray(data) ? data : []);
    }).finally(() => setLoading(false));
  }, []);

  async function act(id: string, action: string) {
    setPromoting(id);
    const res = await fetch(`/api/admin/requests/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, storyType: storyType[id] ?? "CLIENT" }),
    });
    const updated = await res.json();
    setRequests(prev => prev.map(r => r.id === id ? updated : r));
    setPromoting(null);
  }

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  const shown = filter === "PENDING" ? requests.filter(r => r.status === "PENDING") : requests;
  const pendingCount = requests.filter(r => r.status === "PENDING").length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 52px)" }}>
      <AppSidebar />
      <div style={{ padding: "1.5rem 2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)" }}>
              Client Requests {pendingCount > 0 && <span style={{ ...mono, fontSize: "0.65rem", background: "var(--amber)", color: "#fff", padding: "0.2rem 0.5rem", borderRadius: 10, marginLeft: "0.5rem" }}>{pendingCount}</span>}
            </h1>
            <p style={{ ...mono, fontSize: "0.65rem", color: "#aaa", marginTop: "0.2rem" }}>Review and promote to board stories</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {(["PENDING", "ALL"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.35rem 0.75rem", border: "1px solid var(--rule)", background: filter === f ? "var(--moss)" : "none", color: filter === f ? "#fff" : "var(--sage)", cursor: "pointer", borderRadius: 2 }}>
                {f === "PENDING" ? "Pending" : "All"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ ...mono, fontSize: "0.78rem", color: "var(--sage)" }}>Loading…</p>
        ) : shown.length === 0 ? (
          <p style={{ ...mono, fontSize: "0.78rem", color: "var(--sage)" }}>{filter === "PENDING" ? "No pending requests." : "No requests yet."}</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {shown.map(r => (
              <div key={r.id} style={{ border: "1px solid var(--rule)", background: "var(--warm-white)", padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "1rem", marginBottom: "0.75rem" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.2rem" }}>{r.title}</p>
                    {r.description && <p style={{ fontSize: "0.80rem", color: "#666", lineHeight: 1.5 }}>{r.description}</p>}
                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                      {r.source && (
                        <span style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.06em", textTransform: "uppercase", background: "#f0f4f8", color: "#6BA3BE", padding: "0.15rem 0.45rem", borderRadius: 3 }}>{r.source}</span>
                      )}
                      {r.org && (
                        <Link href={`/app/companies/${r.org.id}`} style={{ ...mono, fontSize: "0.62rem", color: "var(--amber)", textDecoration: "none" }}>{r.org.name}</Link>
                      )}
                      {r.submittedBy && (
                        <span style={{ ...mono, fontSize: "0.62rem", color: "#aaa" }}>{r.submittedBy.name ?? r.submittedBy.email}</span>
                      )}
                      {r.submitterEmail && !r.submittedBy && (
                        <span style={{ ...mono, fontSize: "0.62rem", color: "#aaa" }}>{r.submitterEmail}</span>
                      )}
                      <span style={{ ...mono, fontSize: "0.62rem", color: "#bbb" }}>
                        {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <span style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.08em", color: STATUS_COLOR[r.status] ?? "#aaa" }}>
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                </div>

                {r.convertedTo && (
                  <p style={{ ...mono, fontSize: "0.62rem", color: "var(--moss)", marginBottom: "0.75rem" }}>
                    → Story: {r.convertedTo.title} ({r.convertedTo.status.replace("_", " ")})
                  </p>
                )}

                {r.status === "PENDING" && (
                  <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
                    <select
                      value={storyType[r.id] ?? "CLIENT"}
                      onChange={e => setStoryType(prev => ({ ...prev, [r.id]: e.target.value }))}
                      style={{ ...mono, fontSize: "0.62rem", padding: "0.35rem 0.55rem", border: "1px solid var(--rule)", background: "var(--paper)", color: "var(--soil)", outline: "none", borderRadius: 2 }}
                    >
                      {STORY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button onClick={() => act(r.id, "promote")} disabled={promoting === r.id} style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.08em", textTransform: "uppercase", background: "var(--moss)", color: "#fff", border: "none", cursor: "pointer", padding: "0.35rem 0.75rem", borderRadius: 2 }}>
                      {promoting === r.id ? "…" : "Promote to board"}
                    </button>
                    <button onClick={() => act(r.id, "decline")} disabled={promoting === r.id} style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.08em", textTransform: "uppercase", background: "none", color: "var(--clay)", border: "1px solid var(--rule)", cursor: "pointer", padding: "0.35rem 0.75rem", borderRadius: 2 }}>
                      Decline
                    </button>
                  </div>
                )}
                {r.status === "DECLINED" && (
                  <button onClick={() => act(r.id, "reopen")} style={{ ...mono, fontSize: "0.58rem", color: "#aaa", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Reopen</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
