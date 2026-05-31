"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const CATEGORIES = ["DEVELOPMENT", "DESIGN", "MEETING", "OPS", "RESEARCH", "OTHER"] as const;
type Category = typeof CATEGORIES[number];

const CAT_LABEL: Record<Category, string> = {
  DEVELOPMENT: "Dev", DESIGN: "Design", MEETING: "Meeting",
  OPS: "Ops", RESEARCH: "Research", OTHER: "Other",
};
const CAT_COLOR: Record<Category, string> = {
  DEVELOPMENT: "pill-green", DESIGN: "pill-blue", MEETING: "pill-amber",
  OPS: "pill-gray", RESEARCH: "pill-purple", OTHER: "pill-gray",
};

type Org = { id: string; name: string };
type TeamMember = { id: string; name: string | null };
type Entry = {
  id: string; date: string; hours: number; category: Category; notes: string | null;
  user: { id: string; name: string | null }; org: { id: string; name: string } | null;
};
type Summary = {
  byMember: { id: string; name: string | null; hours: number }[];
  byOrg: { id: string; name: string; hours: number }[];
  weekly: { weekStart: string; hours: number }[];
  byCategory: { category: string; hours: number }[];
};

function today() { return new Date().toISOString().slice(0, 10); }
function toLocalDate(isoStr: string) { return new Date(isoStr.slice(0, 10) + "T12:00:00"); }

function weekLabel(dateStr: string) {
  const d = toLocalDate(dateStr);
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const fmt = (x: Date) => x.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(mon)} – ${fmt(sun)}`;
}

function groupByWeek(entries: Entry[]) {
  const weeks: Record<string, Entry[]> = {};
  for (const e of entries) {
    const d = toLocalDate(e.date);
    const mon = new Date(d);
    mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = mon.toISOString().slice(0, 10);
    if (!weeks[key]) weeks[key] = [];
    weeks[key].push(e);
  }
  return Object.entries(weeks).sort(([a], [b]) => b.localeCompare(a));
}

function HBar({ value, max, color = "var(--moss)" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ flex: 1, background: "var(--rule)", borderRadius: 2, height: 8, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.3s" }} />
    </div>
  );
}

export default function TimePage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [tab, setTab] = useState<"log" | "dashboard">("log");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [filterUser, setFilterUser] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ date: today(), hours: "", category: "DEVELOPMENT", notes: "", orgId: "" });
  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  function load(userId?: string) {
    setLoading(true);
    const qs = userId ? `?userId=${userId}&weeks=8` : "?weeks=8";
    fetch(`/api/time${qs}`).then(r => r.json()).then(setEntries).finally(() => setLoading(false));
  }

  function loadSummary() {
    setSummaryLoading(true);
    fetch("/api/time/summary?weeks=12").then(r => r.json()).then(setSummary).finally(() => setSummaryLoading(false));
  }

  useEffect(() => {
    load();
    fetch("/api/orgs").then(r => r.json()).then(setOrgs).catch(() => {});
    if (isAdmin) {
      fetch("/api/members").then(r => r.json()).then(setTeam).catch(() => {});
    }
  }, [isAdmin]);

  useEffect(() => {
    if (tab === "dashboard" && isAdmin && !summary) loadSummary();
  }, [tab, isAdmin]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.hours || parseFloat(form.hours) <= 0) { setError("Enter valid hours."); return; }
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/time", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, hours: parseFloat(form.hours) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? `Error ${res.status}`); }
      else {
        setEntries(prev => [data, ...prev]);
        setForm(f => ({ ...f, hours: "", notes: "", orgId: "" }));
        if (summary) loadSummary();
      }
    } catch { setError("Network error"); }
    setSaving(false);
  }

  async function remove(id: string) {
    await fetch(`/api/time?id=${id}`, { method: "DELETE" });
    setEntries(prev => prev.filter(e => e.id !== id));
    if (summary) loadSummary();
  }

  const filtered = filterUser ? entries.filter(e => e.user.id === filterUser) : entries;
  const weeks = groupByWeek(filtered);
  const totalHours = filtered.reduce((s, e) => s + e.hours, 0);

  const inp: React.CSSProperties = {
    background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: "4px",
    padding: "0.55rem 0.7rem", fontFamily: "var(--font-mono)", fontSize: "0.78rem",
    color: "var(--soil)", outline: "none", width: "100%",
  };
  const lbl: React.CSSProperties = {
    fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.10em",
    textTransform: "uppercase", color: "#888", display: "block", marginBottom: "0.3rem",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", minHeight: "calc(100vh - 52px)" }}>
      {/* Left panel: log form */}
      <div style={{ borderRight: "1px solid var(--rule)", padding: "1.5rem", background: "var(--warm)", overflowY: "auto" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--moss)", marginBottom: "1.25rem" }}>
          Log time
        </h2>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div><label style={lbl}>Date</label>
              <input type="date" style={inp} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </div>
            <div><label style={lbl}>Hours</label>
              <input type="number" step="0.25" min="0.25" max="24" style={inp} value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} placeholder="e.g. 2.5" required />
            </div>
          </div>
          <div><label style={lbl}>Category</label>
            <select style={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Client / project (optional)</label>
            <select style={inp} value={form.orgId} onChange={e => setForm(f => ({ ...f, orgId: e.target.value }))}>
              <option value="">— none —</option>
              {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Notes (optional)</label>
            <textarea style={{ ...inp, resize: "vertical", minHeight: "56px" }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="What did you work on?" />
          </div>
          {error && <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--status-block)", background: "#F5EBE0", padding: "0.5rem 0.7rem", borderRadius: "4px" }}>{error}</p>}
          <button type="submit" disabled={saving} className="btn btn-solid" style={{ fontSize: "0.72rem", padding: "0.55rem 1rem" }}>
            {saving ? "Saving…" : "Log entry"}
          </button>
        </form>

        <div style={{ marginTop: "2rem", paddingTop: "1.25rem", borderTop: "1px solid var(--rule)" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "#999", marginBottom: "0.75rem" }}>
            8-week summary {filterUser ? "· filtered" : "· all"}
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", color: "var(--moss)", lineHeight: 1 }}>
            {totalHours.toFixed(1)}<span style={{ fontSize: "0.9rem", color: "var(--sage)", marginLeft: "0.3rem" }}>hrs</span>
          </p>
          <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {CATEGORIES.map(cat => {
              const hrs = filtered.filter(e => e.category === cat).reduce((s, e) => s + e.hours, 0);
              if (!hrs) return null;
              return (
                <div key={cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className={`pill ${CAT_COLOR[cat]}`}>{CAT_LABEL[cat]}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--bark)" }}>{hrs.toFixed(1)}h</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel: tabs */}
      <div style={{ display: "flex", flexDirection: "column", overflowY: "auto" }}>
        {/* Tab bar */}
        <div style={{ borderBottom: "1px solid var(--rule)", display: "flex", gap: 0 }}>
          {(["log", "dashboard"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "0.75rem 1.25rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem",
              letterSpacing: "0.1em", textTransform: "uppercase", background: "none", border: "none",
              borderBottom: tab === t ? "2px solid var(--moss)" : "2px solid transparent",
              color: tab === t ? "var(--moss)" : "var(--sage)", cursor: "pointer",
            }}>
              {t === "log" ? "Time log" : "Dashboard"}
            </button>
          ))}
          {isAdmin && tab === "log" && team.length > 0 && (
            <select style={{ ...inp, width: "auto", marginLeft: "auto", marginRight: "1rem", alignSelf: "center", fontSize: "0.72rem" }}
              value={filterUser} onChange={e => { setFilterUser(e.target.value); load(e.target.value || undefined); }}>
              <option value="">All members</option>
              {team.map(m => <option key={m.id} value={m.id}>{m.name ?? m.id}</option>)}
            </select>
          )}
        </div>

        {/* Log tab */}
        {tab === "log" && (
          <div style={{ padding: "1.5rem", flex: 1 }}>
            {loading ? (
              <p style={{ color: "var(--sage)", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>Loading…</p>
            ) : weeks.length === 0 ? (
              <p style={{ color: "var(--sage)", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>No entries yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
                {weeks.map(([weekStart, weekEntries]) => {
                  const weekTotal = weekEntries.reduce((s, e) => s + e.hours, 0);
                  return (
                    <div key={weekStart}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.6rem", paddingBottom: "0.4rem", borderBottom: "1px solid var(--rule)" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.08em", color: "var(--bark)" }}>{weekLabel(weekStart)}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--moss)", fontWeight: 600 }}>{weekTotal.toFixed(1)}h</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {weekEntries.map(entry => (
                          <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.85rem", background: "var(--warm)", border: "1px solid var(--rule)", borderRadius: "4px" }}>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--bark)", minWidth: "58px" }}>
                              {toLocalDate(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", fontWeight: 600, color: "var(--moss)", minWidth: "36px" }}>{entry.hours}h</span>
                            <span className={`pill ${CAT_COLOR[entry.category]}`}>{CAT_LABEL[entry.category]}</span>
                            {isAdmin && entry.user.name && (
                              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--sage)" }}>{entry.user.name}</span>
                            )}
                            {entry.org && (
                              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--amber)" }}>{entry.org.name}</span>
                            )}
                            {entry.notes && (
                              <span style={{ fontSize: "0.80rem", color: "var(--bark)", fontWeight: 300, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.notes}</span>
                            )}
                            {(entry.user.id === session?.user?.id || isAdmin) && (
                              <button onClick={() => remove(entry.id)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--rule-heavy)", fontSize: "0.75rem", padding: "0.15rem 0.35rem", flexShrink: 0 }} title="Delete">×</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Dashboard tab */}
        {tab === "dashboard" && (
          <div style={{ padding: "1.5rem", flex: 1 }}>
            {!isAdmin ? (
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--sage)" }}>Admin only.</p>
            ) : summaryLoading || !summary ? (
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--sage)" }}>Loading…</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", maxWidth: 900 }}>

                {/* Weekly totals */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <p style={lbl}>Weekly hours — last 12 weeks</p>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80, marginTop: "0.75rem" }}>
                    {(() => {
                      const max = Math.max(...summary.weekly.map(w => w.hours), 1);
                      return summary.weekly.map(w => (
                        <div key={w.weekStart} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--moss)" }}>{w.hours > 0 ? w.hours.toFixed(0) : ""}</span>
                          <div style={{ width: "100%", background: "var(--rule)", borderRadius: 2 }}>
                            <div style={{ height: Math.max((w.hours / max) * 56, w.hours > 0 ? 4 : 0), background: "var(--moss)", borderRadius: 2, transition: "height 0.3s" }} />
                          </div>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: "var(--sage)", transform: "rotate(-45deg)", transformOrigin: "top left", whiteSpace: "nowrap", marginTop: 4 }}>
                            {new Date(w.weekStart + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* By member */}
                <div>
                  <p style={lbl}>By team member — 12 weeks</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.75rem" }}>
                    {summary.byMember.length === 0 ? <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--sage)" }}>No data.</p> :
                      (() => {
                        const max = summary.byMember[0]?.hours ?? 1;
                        return summary.byMember.map(m => (
                          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--ink)", minWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name ?? "Unknown"}</span>
                            <HBar value={m.hours} max={max} color="var(--moss)" />
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--moss)", minWidth: 36, textAlign: "right" }}>{m.hours.toFixed(1)}h</span>
                          </div>
                        ));
                      })()
                    }
                  </div>
                </div>

                {/* By client */}
                <div>
                  <p style={lbl}>By client — 12 weeks</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.75rem" }}>
                    {summary.byOrg.length === 0 ? <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--sage)" }}>No billable time logged.</p> :
                      (() => {
                        const max = summary.byOrg[0]?.hours ?? 1;
                        return summary.byOrg.map(o => (
                          <div key={o.id} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--ink)", minWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.name}</span>
                            <HBar value={o.hours} max={max} color="var(--amber)" />
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--amber)", minWidth: 36, textAlign: "right" }}>{o.hours.toFixed(1)}h</span>
                          </div>
                        ));
                      })()
                    }
                  </div>
                </div>

                {/* By category */}
                <div>
                  <p style={lbl}>By category — 12 weeks</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.75rem" }}>
                    {summary.byCategory.length === 0 ? <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--sage)" }}>No data.</p> :
                      (() => {
                        const max = summary.byCategory[0]?.hours ?? 1;
                        return summary.byCategory.map(c => (
                          <div key={c.category} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <span className={`pill ${CAT_COLOR[c.category as Category] ?? "pill-gray"}`} style={{ minWidth: 60 }}>{CAT_LABEL[c.category as Category] ?? c.category}</span>
                            <HBar value={c.hours} max={max} color="var(--sage)" />
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--sage)", minWidth: 36, textAlign: "right" }}>{c.hours.toFixed(1)}h</span>
                          </div>
                        ));
                      })()
                    }
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
