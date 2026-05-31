"use client";

import { useState, useEffect } from "react";

type Story = { id: string; title: string; status: string; type: string; points: number; updatedAt: string };
type Request = { id: string; title: string; description: string | null; status: string; createdAt: string; convertedToId: string | null };
type Proposal = { id: string; title: string; status: string; shareToken: string | null; sentAt: string | null; createdAt: string };
type Meeting = { id: string; date: string; contactName: string; notes: string | null; meaningful: boolean };

const STATUS_LABEL: Record<string, string> = { IN_PROGRESS: "In Progress", REVIEW: "In Review", DONE: "Done" };
const STATUS_COLOR: Record<string, string> = { IN_PROGRESS: "var(--moss)", REVIEW: "var(--amber)", DONE: "var(--sage)" };
const REQ_STATUS_LABEL: Record<string, string> = { PENDING: "Pending", REVIEWED: "Reviewed", CONVERTED: "On board", DECLINED: "Declined" };
const REQ_STATUS_COLOR: Record<string, string> = { PENDING: "var(--amber)", REVIEWED: "#6BA3BE", CONVERTED: "var(--moss)", DECLINED: "var(--clay)" };
const PROP_STATUS_COLOR: Record<string, string> = { DRAFT: "#aaa", SENT: "#6BA3BE", ACCEPTED: "var(--moss)", REJECTED: "var(--clay)", EXPIRED: "#aaa" };

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ClientPortal({ orgId, orgName, isPreview = false }: { orgId?: string; orgName?: string; isPreview?: boolean }) {
  const [stories, setStories] = useState<Story[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "" });
  const [contactMsg, setContactMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [contactSending, setContactSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const qs = orgId ? `?orgId=${orgId}` : "";

  useEffect(() => {
    Promise.all([
      fetch(`/api/client/stories${qs}`).then(r => r.json()),
      fetch(`/api/client/requests${qs}`).then(r => r.json()),
      fetch(`/api/client/proposals${qs}`).then(r => r.json()),
      fetch(`/api/client/meetings${qs}`).then(r => r.json()),
    ]).then(([s, r, p, m]) => {
      setStories(Array.isArray(s) ? s : []);
      setRequests(Array.isArray(r) ? r : []);
      setProposals(Array.isArray(p) ? p : []);
      setMeetings(Array.isArray(m) ? m : []);
    }).finally(() => setLoading(false));
  }, [qs]);

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true); setFormError(null);
    try {
      const res = await fetch("/api/client/requests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, description: form.description, orgId }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error ?? "Error"); }
      else {
        setRequests(prev => [data, ...prev]);
        setForm({ title: "", description: "" });
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
      }
    } catch { setFormError("Network error"); }
    setSubmitting(false);
  }

  async function sendContact(e: React.FormEvent) {
    e.preventDefault();
    if (!contactMsg.trim()) return;
    setContactSending(true);
    try {
      await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName ?? "Client", email: "portal@gaia.solutions", message: contactMsg }),
      });
      setContactMsg("");
      setContactSent(true);
      setTimeout(() => setContactSent(false), 4000);
    } catch {}
    setContactSending(false);
  }

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  const lbl: React.CSSProperties = { ...mono, fontSize: "0.58rem", letterSpacing: "0.10em", textTransform: "uppercase" as const, color: "#888", display: "block", marginBottom: "0.3rem" };
  const inp: React.CSSProperties = { background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: "4px", padding: "0.55rem 0.7rem", fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--soil)", outline: "none", width: "100%", boxSizing: "border-box" as const };
  const card: React.CSSProperties = { border: "1px solid var(--rule)", background: "var(--warm-white)" };
  const cardHead: React.CSSProperties = { padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--rule)" };
  const cardHeadLabel: React.CSSProperties = { ...mono, fontSize: "0.65rem", letterSpacing: "0.10em", textTransform: "uppercase" as const, color: "#555" };

  return (
    <div style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      {isPreview && (
        <div style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.10em", textTransform: "uppercase", background: "var(--amber)", color: "#fff", padding: "0.4rem 1rem", marginBottom: "1.5rem", borderRadius: 2, display: "inline-block" }}>
          Admin preview — {orgName}
        </div>
      )}

      <div style={{ marginBottom: "2rem" }}>
        <p style={{ ...mono, fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--moss)", marginBottom: "0.25rem" }}>Client portal</p>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--ink)" }}>{orgName ?? "Your projects"}</h1>
      </div>

      {loading ? (
        <p style={{ ...mono, fontSize: "0.78rem", color: "var(--sage)" }}>Loading…</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>

          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Active work */}
            <div style={card}>
              <div style={cardHead}><p style={cardHeadLabel}>Active work ({stories.length})</p></div>
              {stories.length === 0 ? (
                <p style={{ ...mono, fontSize: "0.72rem", color: "#aaa", padding: "1.25rem", textAlign: "center" }}>No active projects yet.</p>
              ) : (
                <div>
                  {stories.map((s, i) => (
                    <div key={s.id} style={{ padding: "0.75rem 1.25rem", borderBottom: i < stories.length - 1 ? "1px solid var(--rule)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                      <p style={{ fontSize: "0.88rem", color: "var(--ink)", flex: 1 }}>{s.title}</p>
                      <span style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.08em", color: STATUS_COLOR[s.status] ?? "#aaa", whiteSpace: "nowrap" }}>{STATUS_LABEL[s.status] ?? s.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Proposals */}
            {proposals.length > 0 && (
              <div style={card}>
                <div style={cardHead}><p style={cardHeadLabel}>Proposals ({proposals.length})</p></div>
                <div>
                  {proposals.map((p, i) => (
                    <div key={p.id} style={{ padding: "0.75rem 1.25rem", borderBottom: i < proposals.length - 1 ? "1px solid var(--rule)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                      <div>
                        <p style={{ fontSize: "0.88rem", color: "var(--ink)" }}>{p.title}</p>
                        {p.sentAt && <p style={{ ...mono, fontSize: "0.60rem", color: "#aaa", marginTop: "0.2rem" }}>Sent {fmt(p.sentAt)}</p>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.08em", color: PROP_STATUS_COLOR[p.status] ?? "#aaa" }}>{p.status}</span>
                        {p.shareToken && (
                          <a href={`/p/${p.shareToken}`} target="_blank" rel="noopener noreferrer" style={{ ...mono, fontSize: "0.60rem", color: "var(--moss)", textDecoration: "none" }}>View →</a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meeting notes */}
            {meetings.length > 0 && (
              <div style={card}>
                <div style={cardHead}><p style={cardHeadLabel}>Meeting notes ({meetings.length})</p></div>
                <div>
                  {meetings.map((m, i) => (
                    <div key={m.id} style={{ padding: "0.85rem 1.25rem", borderBottom: i < meetings.length - 1 ? "1px solid var(--rule)" : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.3rem" }}>
                        <span style={{ ...mono, fontSize: "0.65rem", color: "var(--ink)", fontWeight: 600 }}>{fmt(m.date)}</span>
                        <span style={{ ...mono, fontSize: "0.60rem", color: "#aaa" }}>{m.contactName}</span>
                      </div>
                      {m.notes && <p style={{ fontSize: "0.82rem", color: "#555", lineHeight: 1.5 }}>{m.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past requests */}
            {requests.length > 0 && (
              <div style={card}>
                <div style={cardHead}><p style={cardHeadLabel}>Your requests</p></div>
                <div>
                  {requests.map((r, i) => (
                    <div key={r.id} style={{ padding: "0.75rem 1.25rem", borderBottom: i < requests.length - 1 ? "1px solid var(--rule)" : "none", display: "flex", justifyContent: "space-between", alignItems: "start", gap: "1rem" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "0.85rem", color: "var(--ink)" }}>{r.title}</p>
                        {r.description && <p style={{ fontSize: "0.75rem", color: "#777", marginTop: "0.2rem", lineHeight: 1.4 }}>{r.description}</p>}
                        <p style={{ ...mono, fontSize: "0.58rem", color: "#aaa", marginTop: "0.3rem" }}>{fmt(r.createdAt)}</p>
                      </div>
                      <span style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.08em", color: REQ_STATUS_COLOR[r.status] ?? "#aaa", whiteSpace: "nowrap" }}>{REQ_STATUS_LABEL[r.status] ?? r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Submit a request */}
            <div style={{ ...card, padding: "1.25rem" }}>
              <p style={cardHeadLabel}>Submit a request</p>
              <div style={{ marginTop: "0.75rem" }}>
                {submitted ? (
                  <p style={{ ...mono, fontSize: "0.72rem", color: "var(--moss)" }}>Request submitted — we&apos;ll be in touch.</p>
                ) : (
                  <form onSubmit={submitRequest} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                    <div>
                      <label style={lbl}>What do you need?</label>
                      <input type="text" style={inp} placeholder="Brief title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required disabled={isPreview} />
                    </div>
                    <div>
                      <label style={lbl}>Details (optional)</label>
                      <textarea style={{ ...inp, minHeight: 72, resize: "vertical" }} placeholder="Context, deadlines, specifics…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} disabled={isPreview} />
                    </div>
                    {formError && <p style={{ ...mono, fontSize: "0.68rem", color: "var(--clay)" }}>{formError}</p>}
                    {isPreview ? (
                      <p style={{ ...mono, fontSize: "0.62rem", color: "#aaa" }}>Disabled in preview.</p>
                    ) : (
                      <button type="submit" disabled={submitting} style={{ ...mono, fontSize: "0.68rem", letterSpacing: "0.10em", textTransform: "uppercase", background: "var(--moss)", color: "#fff", border: "none", cursor: "pointer", padding: "0.55rem 1rem", alignSelf: "flex-start", borderRadius: 2 }}>
                        {submitting ? "Submitting…" : "Submit"}
                      </button>
                    )}
                  </form>
                )}
              </div>
            </div>

            {/* Contact the team */}
            <div style={{ ...card, padding: "1.25rem" }}>
              <p style={cardHeadLabel}>Contact the team</p>
              <div style={{ marginTop: "0.75rem" }}>
                {contactSent ? (
                  <p style={{ ...mono, fontSize: "0.72rem", color: "var(--moss)" }}>Message sent — we&apos;ll reply shortly.</p>
                ) : (
                  <form onSubmit={sendContact} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                    <div>
                      <label style={lbl}>Message</label>
                      <textarea style={{ ...inp, minHeight: 80, resize: "vertical" }} placeholder="Quick question or note for the team…" value={contactMsg} onChange={e => setContactMsg(e.target.value)} required disabled={isPreview} />
                    </div>
                    {isPreview ? (
                      <p style={{ ...mono, fontSize: "0.62rem", color: "#aaa" }}>Disabled in preview.</p>
                    ) : (
                      <button type="submit" disabled={contactSending} style={{ ...mono, fontSize: "0.68rem", letterSpacing: "0.10em", textTransform: "uppercase", background: "var(--ink)", color: "#fff", border: "none", cursor: "pointer", padding: "0.55rem 1rem", alignSelf: "flex-start", borderRadius: 2 }}>
                        {contactSending ? "Sending…" : "Send"}
                      </button>
                    )}
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
