"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type LineItem = { id: string; title: string; description: string | null; hours: number; sortOrder: number };
type Org = { id: string; name: string };
type Contact = { id: string; name: string };
type Proposal = {
  id: string; title: string; status: string; projectDesc: string | null; coverLetter: string | null;
  termsNote: string | null; ratePerHour: number; expiresAt: Date | null; sentAt: Date | null;
  shareToken: string | null; org: Org | null; contact: Contact | null; items: LineItem[];
};

const STATUSES = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"] as const;

export default function ProposalWorkspace({
  proposal: initial, orgs, contacts,
}: {
  proposal: Proposal;
  orgs: Org[];
  contacts: Contact[];
}) {
  const router = useRouter();
  const [p, setP] = useState(initial);
  const [items, setItems] = useState<LineItem[]>(initial.items);
  const [generating, setGenerating] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", description: "", hours: "" });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemForm, setEditItemForm] = useState({ title: "", description: "", hours: "" });
  const coverRef = useRef<HTMLTextAreaElement>(null);

  const totalHours = items.reduce((s, i) => s + i.hours, 0);
  const totalCost = totalHours * p.ratePerHour;
  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  const field: React.CSSProperties = { ...mono, fontSize: "0.75rem", padding: "0.4rem 0.55rem", background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: "2px", color: "var(--soil)", outline: "none", boxSizing: "border-box" as const };
  const lbl: React.CSSProperties = { ...mono, fontSize: "0.56rem", letterSpacing: "0.10em", textTransform: "uppercase" as const, color: "var(--lichen)", display: "block", marginBottom: "0.2rem" };

  async function saveMeta(patch: Record<string, unknown>) {
    setSavingMeta(true);
    const res = await fetch(`/api/proposals/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const updated = await res.json();
    setP(prev => ({ ...prev, ...updated }));
    setSavingMeta(false);
  }

  async function addItem() {
    if (!newItem.title.trim()) return;
    const res = await fetch(`/api/proposals/${p.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newItem, hours: parseFloat(newItem.hours) || 0, sortOrder: items.length }),
    });
    const item = await res.json();
    setItems(prev => [...prev, item]);
    setNewItem({ title: "", description: "", hours: "" });
  }

  async function deleteItem(id: string) {
    await fetch(`/api/proposals/${p.id}/items/${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function startEditItem(item: LineItem) {
    setEditingItemId(item.id);
    setEditItemForm({ title: item.title, description: item.description ?? "", hours: String(item.hours) });
  }

  async function saveItem(id: string) {
    const res = await fetch(`/api/proposals/${p.id}/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editItemForm, hours: parseFloat(editItemForm.hours) || 0 }),
    });
    const updated = await res.json();
    setItems(prev => prev.map(i => i.id === id ? updated : i));
    setEditingItemId(null);
  }

  async function generate() {
    setGenerating(true);
    setP(prev => ({ ...prev, coverLetter: "" }));
    const res = await fetch(`/api/proposals/${p.id}/generate`, { method: "POST" });
    if (!res.body) { setGenerating(false); return; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      full += decoder.decode(value, { stream: true });
      setP(prev => ({ ...prev, coverLetter: full }));
      if (coverRef.current) coverRef.current.scrollTop = coverRef.current.scrollHeight;
    }
    setGenerating(false);
  }

  async function markSent() {
    await saveMeta({ status: "SENT" });
    router.refresh();
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "0", flex: 1, minHeight: 0 }}>

      {/* LEFT — line items + meta */}
      <div style={{ padding: "1.5rem 2rem", overflowY: "auto", borderRight: "1px solid var(--rule)" }}>

        {/* Status bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <select
            value={p.status}
            onChange={e => saveMeta({ status: e.target.value })}
            style={{ ...field, width: "auto" }}
          >
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <div style={{ display: "flex", gap: "0.5rem", marginLeft: "auto", flexWrap: "wrap" }}>
            {p.status === "DRAFT" && (
              <button onClick={markSent} className="btn btn-amber" style={{ padding: "0.35rem 0.9rem", fontSize: "0.65rem" }}>
                Mark as Sent
              </button>
            )}
            <Link href={`/app/proposals/${p.id}/preview`} target="_blank" className="btn btn-ghost" style={{ padding: "0.35rem 0.9rem", fontSize: "0.65rem" }}>
              Preview
            </Link>
            {p.shareToken && (
              <button
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/p/${p.shareToken}`)}
                className="btn btn-ghost"
                style={{ padding: "0.35rem 0.9rem", fontSize: "0.65rem" }}
              >
                Copy link
              </button>
            )}
          </div>
        </div>

        {/* Meta fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={lbl}>Company</label>
            <select style={{ ...field, width: "100%" }} value={p.org?.id ?? ""} onChange={e => saveMeta({ orgId: e.target.value })}>
              <option value="">— none —</option>
              {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Contact</label>
            <select style={{ ...field, width: "100%" }} value={p.contact?.id ?? ""} onChange={e => saveMeta({ contactId: e.target.value })}>
              <option value="">— none —</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Rate ($/hr)</label>
            <input
              type="number"
              style={{ ...field, width: "100%" }}
              defaultValue={p.ratePerHour}
              onBlur={e => saveMeta({ ratePerHour: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label style={lbl}>Valid until</label>
            <input
              type="date"
              style={{ ...field, width: "100%" }}
              defaultValue={p.expiresAt ? new Date(p.expiresAt).toISOString().split("T")[0] : ""}
              onBlur={e => saveMeta({ expiresAt: e.target.value || null })}
            />
          </div>
        </div>

        {/* Line items */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.75rem" }}>
            <p style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--moss)" }}>Scope of work</p>
            <p style={{ ...mono, fontSize: "0.60rem", color: "var(--sage)" }}>{totalHours}h total</p>
          </div>

          <div style={{ border: "1px solid var(--rule)", background: "var(--rule)" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 70px 60px", gap: "1px" }}>
              {["Deliverable", "Description", "Hours", ""].map(h => (
                <div key={h} style={{ background: "#E8EDE4", padding: "0.4rem 0.6rem" }}>
                  <span style={{ ...mono, fontSize: "0.56rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--sage)" }}>{h}</span>
                </div>
              ))}
            </div>

            {items.map(item => (
              <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 70px 60px", gap: "1px", background: "var(--rule)" }}>
                {editingItemId === item.id ? (
                  <>
                    <div style={{ background: "var(--warm)", padding: "0.4rem 0.5rem" }}>
                      <input style={{ ...field, width: "100%", marginBottom: "0.25rem" }} value={editItemForm.title} onChange={e => setEditItemForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div style={{ background: "var(--warm)", padding: "0.4rem 0.5rem" }}>
                      <input style={{ ...field, width: "100%" }} value={editItemForm.description} onChange={e => setEditItemForm(f => ({ ...f, description: e.target.value }))} placeholder="optional" />
                    </div>
                    <div style={{ background: "var(--warm)", padding: "0.4rem 0.5rem" }}>
                      <input type="number" style={{ ...field, width: "100%" }} value={editItemForm.hours} onChange={e => setEditItemForm(f => ({ ...f, hours: e.target.value }))} />
                    </div>
                    <div style={{ background: "var(--warm)", padding: "0.4rem 0.5rem", display: "flex", gap: "0.3rem", alignItems: "center" }}>
                      <button onClick={() => saveItem(item.id)} style={{ ...mono, fontSize: "0.58rem", color: "var(--fern)", background: "none", border: "none", cursor: "pointer" }}>✓</button>
                      <button onClick={() => setEditingItemId(null)} style={{ ...mono, fontSize: "0.58rem", color: "var(--clay)", background: "none", border: "none", cursor: "pointer" }}>✕</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ background: "var(--warm)", padding: "0.5rem 0.6rem" }}>
                      <p style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--soil)" }}>{item.title}</p>
                    </div>
                    <div style={{ background: "var(--warm)", padding: "0.5rem 0.6rem" }}>
                      <p style={{ ...mono, fontSize: "0.62rem", color: "var(--clay)" }}>{item.description ?? ""}</p>
                    </div>
                    <div style={{ background: "var(--warm)", padding: "0.5rem 0.6rem" }}>
                      <p style={{ ...mono, fontSize: "0.72rem", color: "var(--soil)" }}>{item.hours}h</p>
                      <p style={{ ...mono, fontSize: "0.58rem", color: "var(--lichen)" }}>${(item.hours * p.ratePerHour).toLocaleString()}</p>
                    </div>
                    <div style={{ background: "var(--warm)", padding: "0.5rem 0.6rem", display: "flex", gap: "0.3rem", alignItems: "center" }}>
                      <button onClick={() => startEditItem(item)} style={{ ...mono, fontSize: "0.58rem", color: "var(--sage)", background: "none", border: "none", cursor: "pointer" }}>edit</button>
                      <button onClick={() => deleteItem(item.id)} style={{ ...mono, fontSize: "0.58rem", color: "var(--clay)", background: "none", border: "none", cursor: "pointer" }}>✕</button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Add row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 70px 60px", gap: "1px", background: "var(--rule)" }}>
              <div style={{ background: "var(--mycel)", padding: "0.4rem 0.5rem" }}>
                <input style={{ ...field, background: "transparent", border: "none", padding: "0.1rem 0" }} value={newItem.title} onChange={e => setNewItem(f => ({ ...f, title: e.target.value }))} placeholder="+ Add deliverable" onKeyDown={e => e.key === "Enter" && addItem()} />
              </div>
              <div style={{ background: "var(--mycel)", padding: "0.4rem 0.5rem" }}>
                <input style={{ ...field, background: "transparent", border: "none", padding: "0.1rem 0" }} value={newItem.description} onChange={e => setNewItem(f => ({ ...f, description: e.target.value }))} placeholder="description" onKeyDown={e => e.key === "Enter" && addItem()} />
              </div>
              <div style={{ background: "var(--mycel)", padding: "0.4rem 0.5rem" }}>
                <input type="number" style={{ ...field, background: "transparent", border: "none", padding: "0.1rem 0" }} value={newItem.hours} onChange={e => setNewItem(f => ({ ...f, hours: e.target.value }))} placeholder="hrs" onKeyDown={e => e.key === "Enter" && addItem()} />
              </div>
              <div style={{ background: "var(--mycel)", padding: "0.4rem 0.5rem" }}>
                <button onClick={addItem} style={{ ...mono, fontSize: "0.62rem", color: "var(--moss)", background: "none", border: "none", cursor: "pointer" }}>Add</button>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "2rem", marginTop: "0.75rem", padding: "0.6rem 0.75rem", background: "var(--field)", borderRadius: "2px" }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ ...mono, fontSize: "0.56rem", color: "var(--sage)", letterSpacing: "0.10em", textTransform: "uppercase" }}>Total hours</p>
              <p style={{ ...mono, fontSize: "1rem", color: "var(--mycel)", fontWeight: 500 }}>{totalHours}h</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ ...mono, fontSize: "0.56rem", color: "var(--sage)", letterSpacing: "0.10em", textTransform: "uppercase" }}>Total investment</p>
              <p style={{ ...mono, fontSize: "1rem", color: "var(--amber-light)", fontWeight: 500 }}>${totalCost.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div>
          <label style={{ ...lbl, marginBottom: "0.4rem" }}>Terms / out of scope</label>
          <textarea
            style={{ ...field, width: "100%", resize: "vertical", minHeight: "72px" }}
            defaultValue={p.termsNote ?? ""}
            onBlur={e => saveMeta({ termsNote: e.target.value })}
            placeholder="Payment terms, what's explicitly excluded, revision limits, etc."
          />
        </div>
      </div>

      {/* RIGHT — project description + cover letter */}
      <div style={{ padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* Project description */}
        <div>
          <label style={{ ...lbl, marginBottom: "0.4rem" }}>Project description</label>
          <textarea
            style={{ ...field, width: "100%", resize: "vertical", minHeight: "100px" }}
            defaultValue={p.projectDesc ?? ""}
            onBlur={e => saveMeta({ projectDesc: e.target.value })}
            placeholder="Describe what the client needs, the problem being solved, their context. This feeds the AI."
          />
        </div>

        {/* Cover letter */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
            <label style={lbl}>Cover letter</label>
            <button
              onClick={generate}
              disabled={generating}
              style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.08em", textTransform: "uppercase", background: generating ? "var(--field-mid)" : "var(--moss)", color: generating ? "var(--sage)" : "var(--mycel)", border: "none", cursor: generating ? "default" : "pointer", padding: "0.3rem 0.7rem", borderRadius: "2px" }}
            >
              {generating ? "Generating…" : "Generate with AI"}
            </button>
          </div>
          <textarea
            ref={coverRef}
            style={{ ...field, width: "100%", resize: "vertical", flex: 1, minHeight: "320px", lineHeight: 1.7, fontSize: "0.80rem" }}
            value={p.coverLetter ?? ""}
            onChange={e => setP(prev => ({ ...prev, coverLetter: e.target.value }))}
            onBlur={e => saveMeta({ coverLetter: e.target.value })}
            placeholder="Click 'Generate with AI' to write a cover letter, or type your own."
          />
        </div>

        {savingMeta && (
          <p style={{ ...mono, fontSize: "0.58rem", color: "var(--lichen)", textAlign: "right" }}>Saving…</p>
        )}
      </div>
    </div>
  );
}
