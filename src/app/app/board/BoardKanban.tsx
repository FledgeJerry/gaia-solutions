"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Contact = { id: string; name: string } | null;
type Org = { id: string; name: string } | null;
type User = { id: string; name: string | null } | null;
type Sprint = { id: string; number: number } | null;

type Story = {
  id: string;
  title: string;
  status: string;
  type: string;
  points: number;
  blocked: boolean;
  flagged: boolean;
  contact: Contact;
  org: Org;
  assignedTo: User;
  sprint: Sprint;
};

type OrgOption = { id: string; name: string };
type ContactOption = { id: string; name: string };
type SprintOption = { id: string; number: number };

const COLUMNS = [
  { key: "BACKLOG",     label: "Backlog" },
  { key: "SPRINT",      label: "Sprint" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "REVIEW",      label: "Review" },
  { key: "DONE",        label: "Done" },
] as const;

const STORY_TYPES = ["CLIENT", "PARTNER", "INTERNAL", "OPEN_SOURCE", "INVESTIGATION", "GOVERNANCE"] as const;
const STATUSES = ["BACKLOG", "SPRINT", "IN_PROGRESS", "REVIEW", "DONE"] as const;

const TYPE_COLORS: Record<string, string> = {
  CLIENT: "var(--amber)", PARTNER: "#6BA3BE", INTERNAL: "var(--sage)",
  OPEN_SOURCE: "var(--fern)", INVESTIGATION: "#B87CB8", GOVERNANCE: "var(--clay)",
};

const NEXT_STATUS: Record<string, string> = {
  BACKLOG: "SPRINT", SPRINT: "IN_PROGRESS", IN_PROGRESS: "REVIEW", REVIEW: "DONE",
};
const PREV_STATUS: Record<string, string> = {
  SPRINT: "BACKLOG", IN_PROGRESS: "SPRINT", REVIEW: "IN_PROGRESS", DONE: "REVIEW",
};

const TIME_CATS = ["DEVELOPMENT", "DESIGN", "MEETING", "OPS", "RESEARCH", "OTHER"] as const;
const CAT_LABEL: Record<string, string> = { DEVELOPMENT: "Dev", DESIGN: "Design", MEETING: "Meeting", OPS: "Ops", RESEARCH: "Research", OTHER: "Other" };

type TimeEntry = { id: string; date: string; hours: number; category: string; notes: string | null; user: { id: string; name: string | null } };

function todayStr() { return new Date().toISOString().slice(0, 10); }

export default function BoardKanban({ stories: initial, sprints }: { stories: Story[]; sprints: SprintOption[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [stories, setStories] = useState<Story[]>(initial);
  const [editing, setEditing] = useState<Story | null>(null);
  const [orgs, setOrgs] = useState<OrgOption[]>([]);
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [form, setForm] = useState({ title: "", type: "", status: "", points: 1, blocked: false, flagged: false, orgId: "", contactId: "", sprintId: "" });
  const [saving, setSaving] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [timeOpen, setTimeOpen] = useState(false);
  const [timeForm, setTimeForm] = useState({ date: todayStr(), hours: "", category: "DEVELOPMENT", notes: "" });
  const [timeSaving, setTimeSaving] = useState(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [timeError, setTimeError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/orgs").then(r => r.json()),
      fetch("/api/contacts").then(r => r.json()),
    ]).then(([o, c]) => { setOrgs(o); setContacts(c); }).catch(() => {});
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setEditing(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function openEdit(story: Story) {
    setEditing(story);
    setTimeOpen(false);
    setTimeError(null);
    setTimeForm({ date: todayStr(), hours: "", category: "DEVELOPMENT", notes: "" });
    setTimeEntries([]);
    setForm({
      title: story.title,
      type: story.type,
      status: story.status,
      points: story.points,
      blocked: story.blocked,
      flagged: story.flagged,
      orgId: story.org?.id ?? "",
      contactId: story.contact?.id ?? "",
      sprintId: story.sprint?.id ?? "",
    });
    fetch(`/api/time?storyId=${story.id}&weeks=52`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTimeEntries(data); })
      .catch(() => {});
  }

  async function logTime(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !timeForm.hours || parseFloat(timeForm.hours) <= 0) return;
    setTimeSaving(true); setTimeError(null);
    try {
      const res = await fetch("/api/time", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...timeForm,
          hours: parseFloat(timeForm.hours),
          storyId: editing.id,
          orgId: form.orgId || editing.org?.id || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setTimeError(data.error ?? "Error"); }
      else {
        setTimeEntries(prev => [data, ...prev]);
        setTimeForm(f => ({ ...f, hours: "", notes: "" }));
        setTimeOpen(false);
      }
    } catch { setTimeError("Network error"); }
    setTimeSaving(false);
  }

  function setF(field: string, value: string | number | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function move(id: string, newStatus: string) {
    setStories(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    if (editing?.id === id) setForm(f => ({ ...f, status: newStatus }));
    await fetch(`/api/stories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    const res = await fetch(`/api/stories/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const updated = await res.json();
    setStories(prev => prev.map(s => s.id === editing.id ? { ...s, ...updated } : s));
    setSaving(false);
    setEditing(null);
    router.refresh();
  }

  async function deleteStory() {
    if (!editing) return;
    if (!confirm(`Delete "${editing.title}"?`)) return;
    await fetch(`/api/stories/${editing.id}`, { method: "DELETE" });
    setStories(prev => prev.filter(s => s.id !== editing.id));
    setEditing(null);
    router.refresh();
  }

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  const fieldCss: React.CSSProperties = { ...mono, fontSize: "0.75rem", padding: "0.4rem 0.55rem", background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: "2px", color: "var(--soil)", outline: "none", width: "100%", boxSizing: "border-box" };
  const lblCss: React.CSSProperties = { ...mono, fontSize: "0.55rem", letterSpacing: "0.10em", textTransform: "uppercase" as const, color: "var(--lichen)", display: "block", marginBottom: "0.2rem" };

  return (
    <>
      {/* Board */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1px", background: "var(--rule)", border: "1px solid var(--rule)", overflowX: "auto" }}>
        {COLUMNS.map(col => {
          const colStories = stories.filter(s => s.status === col.key);
          return (
            <div key={col.key} style={{ background: "var(--field)", minWidth: "160px" }}>
              <div style={{ padding: "0.6rem 0.75rem", borderBottom: "1px solid var(--field-rule)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--field-mid)" }}>
                <span style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--lichen)" }}>{col.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ ...mono, fontSize: "0.58rem", color: "var(--sage)" }}>{colStories.length}</span>
                  {colStories.length > 0 && (
                    <span style={{ ...mono, fontSize: "0.58rem", background: "var(--field-border)", color: "var(--lichen)", padding: "0.1rem 0.35rem", borderRadius: "2px" }}>
                      {colStories.reduce((sum, s) => sum + s.points, 0)}pt
                    </span>
                  )}
                </div>
              </div>

              <div style={{ padding: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", minHeight: "200px" }}>
                {colStories.map(story => {
                  const isEditing = editing?.id === story.id;
                  return (
                    <div
                      key={story.id}
                      style={{
                        background: "var(--warm)",
                        border: `1px solid ${story.blocked ? "var(--status-block)" : isEditing ? "var(--amber)" : "var(--rule)"}`,
                        borderRadius: "2px",
                        padding: "0.6rem 0.7rem",
                        cursor: "default",
                      }}
                    >
                      {/* Type + points + edit */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                        <span style={{ ...mono, fontSize: "0.55rem", color: TYPE_COLORS[story.type] ?? "var(--sage)", letterSpacing: "0.06em" }}>{story.type.replace("_", " ")}</span>
                        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                          <span style={{ ...mono, fontSize: "0.58rem", color: "var(--lichen)" }}>{story.points}pt</span>
                          <button
                            onClick={() => isEditing ? setEditing(null) : openEdit(story)}
                            style={{ ...mono, fontSize: "0.55rem", color: isEditing ? "var(--amber)" : "var(--sage)", background: "none", border: "none", cursor: "pointer", padding: "0 0.1rem", lineHeight: 1 }}
                            title="Edit"
                          >
                            {isEditing ? "✕" : "edit"}
                          </button>
                        </div>
                      </div>

                      <p style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--soil)", lineHeight: 1.35, marginBottom: "0.35rem" }}>{story.title}</p>

                      {(story.contact || story.org || story.sprint) && (
                        <p style={{ ...mono, fontSize: "0.60rem", color: "var(--clay)", marginBottom: "0.35rem" }}>
                          {[story.contact?.name ?? story.org?.name, story.sprint && `Sprint ${story.sprint.number}`].filter(Boolean).join(" · ")}
                        </p>
                      )}

                      {(story.blocked || story.flagged) && (
                        <div style={{ display: "flex", gap: "0.3rem", marginBottom: "0.35rem" }}>
                          {story.blocked && <span style={{ ...mono, fontSize: "0.50rem", background: "#F5EBE0", color: "var(--status-block)", padding: "0.1rem 0.3rem", borderRadius: "2px" }}>BLOCKED</span>}
                          {story.flagged && <span style={{ ...mono, fontSize: "0.50rem", background: "var(--amber-bg)", color: "var(--amber-dim)", padding: "0.1rem 0.3rem", borderRadius: "2px" }}>FLAG</span>}
                        </div>
                      )}

                      {/* Move actions */}
                      <div style={{ display: "flex", gap: "0.3rem", justifyContent: "flex-end", marginTop: "0.25rem" }}>
                        {PREV_STATUS[story.status] && (
                          <button onClick={() => move(story.id, PREV_STATUS[story.status])} style={{ ...mono, fontSize: "0.60rem", color: "var(--sage)", background: "none", border: "1px solid var(--rule)", borderRadius: "2px", cursor: "pointer", padding: "0.1rem 0.4rem", lineHeight: 1 }} title="Move back">←</button>
                        )}
                        {NEXT_STATUS[story.status] && (
                          <button onClick={() => move(story.id, NEXT_STATUS[story.status])} style={{ ...mono, fontSize: "0.60rem", color: "var(--soil)", background: "none", border: "1px solid var(--rule)", borderRadius: "2px", cursor: "pointer", padding: "0.1rem 0.4rem", lineHeight: 1 }} title="Move forward">→</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit drawer */}
      {editing && (
        <>
          {/* Backdrop */}
          <div onClick={() => setEditing(null)} style={{ position: "fixed", inset: 0, background: "rgba(26,18,8,0.35)", zIndex: 40 }} />

          {/* Panel */}
          <div ref={drawerRef} style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: "340px", background: "var(--warm)", borderLeft: "1px solid var(--rule)", zIndex: 50, display: "flex", flexDirection: "column", overflowY: "auto" }}>
            {/* Drawer header */}
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--field)", flexShrink: 0 }}>
              <span style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--lichen)" }}>Edit story</span>
              <button onClick={() => setEditing(null)} style={{ ...mono, fontSize: "0.72rem", color: "var(--sage)", background: "none", border: "none", cursor: "pointer" }}>✕</button>
            </div>

            {/* Form */}
            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
              <div>
                <label style={lblCss}>Title</label>
                <textarea
                  style={{ ...fieldCss, resize: "vertical", minHeight: "60px" }}
                  value={form.title}
                  onChange={e => setF("title", e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={lblCss}>Type</label>
                  <select style={fieldCss} value={form.type} onChange={e => setF("type", e.target.value)}>
                    {STORY_TYPES.map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lblCss}>Status</label>
                  <select style={fieldCss} value={form.status} onChange={e => setF("status", e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={lblCss}>Points</label>
                <input type="number" min="1" max="13" style={{ ...fieldCss, width: "80px" }} value={form.points} onChange={e => setF("points", parseInt(e.target.value) || 1)} />
              </div>

              <div>
                <label style={lblCss}>Sprint</label>
                <select style={fieldCss} value={form.sprintId} onChange={e => setF("sprintId", e.target.value)}>
                  <option value="">— backlog / unassigned —</option>
                  {sprints.map(s => <option key={s.id} value={s.id}>Sprint {s.number}</option>)}
                </select>
              </div>

              <div>
                <label style={lblCss}>Company</label>
                <select style={fieldCss} value={form.orgId} onChange={e => setF("orgId", e.target.value)}>
                  <option value="">— none —</option>
                  {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>

              <div>
                <label style={lblCss}>Contact</label>
                <select style={fieldCss} value={form.contactId} onChange={e => setF("contactId", e.target.value)}>
                  <option value="">— none —</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div style={{ display: "flex", gap: "1.25rem", paddingTop: "0.25rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.blocked} onChange={e => setF("blocked", e.target.checked)} style={{ accentColor: "var(--status-block)" }} />
                  <span style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--clay)" }}>Blocked</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.flagged} onChange={e => setF("flagged", e.target.checked)} style={{ accentColor: "var(--amber)" }} />
                  <span style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--clay)" }}>Flagged</span>
                </label>
              </div>
            </div>

            {/* Time section */}
            <div style={{ borderTop: "1px solid var(--rule)", flexShrink: 0 }}>
              <button
                onClick={() => setTimeOpen(o => !o)}
                style={{ ...mono, width: "100%", padding: "0.65rem 1.25rem", fontSize: "0.60rem", letterSpacing: "0.10em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", textAlign: "left", color: "var(--moss)", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span>Log time {timeEntries.length > 0 && `· ${timeEntries.reduce((s, e) => s + e.hours, 0).toFixed(1)}h logged`}</span>
                <span style={{ fontSize: "0.72rem" }}>{timeOpen ? "▲" : "▼"}</span>
              </button>
              {timeOpen && (
                <div style={{ padding: "0 1.25rem 1rem" }}>
                  <form onSubmit={logTime} style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                      <div>
                        <label style={lblCss}>Date</label>
                        <input type="date" style={fieldCss} value={timeForm.date} onChange={e => setTimeForm(f => ({ ...f, date: e.target.value }))} required />
                      </div>
                      <div>
                        <label style={lblCss}>Hours</label>
                        <input type="number" step="0.25" min="0.25" max="24" style={fieldCss} placeholder="e.g. 1.5" value={timeForm.hours} onChange={e => setTimeForm(f => ({ ...f, hours: e.target.value }))} required />
                      </div>
                    </div>
                    <div>
                      <label style={lblCss}>Category</label>
                      <select style={fieldCss} value={timeForm.category} onChange={e => setTimeForm(f => ({ ...f, category: e.target.value }))}>
                        {TIME_CATS.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={lblCss}>Notes (optional)</label>
                      <input type="text" style={fieldCss} placeholder="What did you do?" value={timeForm.notes} onChange={e => setTimeForm(f => ({ ...f, notes: e.target.value }))} />
                    </div>
                    {timeError && <p style={{ ...mono, fontSize: "0.62rem", color: "var(--status-block)" }}>{timeError}</p>}
                    <button type="submit" disabled={timeSaving} style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.08em", background: "var(--fern)", color: "#fff", border: "none", cursor: "pointer", padding: "0.4rem 0.75rem", textTransform: "uppercase", alignSelf: "flex-start" }}>
                      {timeSaving ? "Saving…" : "Log"}
                    </button>
                  </form>
                  {timeEntries.length > 0 && (
                    <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                      {timeEntries.slice(0, 5).map(te => (
                        <div key={te.id} style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.35rem 0.5rem", background: "var(--field)", borderRadius: 2 }}>
                          <span style={{ ...mono, fontSize: "0.62rem", color: "var(--moss)", fontWeight: 600 }}>{te.hours}h</span>
                          <span style={{ ...mono, fontSize: "0.60rem", color: "var(--sage)" }}>{CAT_LABEL[te.category] ?? te.category}</span>
                          {te.user.name && <span style={{ ...mono, fontSize: "0.58rem", color: "var(--lichen)" }}>{te.user.name}</span>}
                          {te.notes && <span style={{ fontSize: "0.68rem", color: "var(--bark)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{te.notes}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer footer */}
            <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <button onClick={deleteStory} style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.08em", color: "var(--status-block)", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase" }}>
                Delete
              </button>
              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button onClick={() => setEditing(null)} style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.08em", color: "var(--sage)", background: "none", border: "1px solid var(--rule)", cursor: "pointer", padding: "0.4rem 0.75rem", textTransform: "uppercase" }}>
                  Cancel
                </button>
                <button onClick={saveEdit} disabled={saving} style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.08em", background: "var(--moss)", color: "var(--mycel)", border: "none", cursor: "pointer", padding: "0.4rem 0.75rem", textTransform: "uppercase", fontWeight: 500 }}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
