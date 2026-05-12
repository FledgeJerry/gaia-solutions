"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppSidebar from "@/components/AppSidebar";

type Org = { id: string; name: string };
type Contact = { id: string; name: string };

export default function NewProposalPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const thirtyDays = new Date();
  thirtyDays.setDate(thirtyDays.getDate() + 30);

  const [form, setForm] = useState({
    title: "",
    orgId: "",
    contactId: "",
    ratePerHour: "150",
    projectDesc: "",
    expiresAt: thirtyDays.toISOString().split("T")[0],
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/orgs").then(r => r.json()),
      fetch("/api/contacts").then(r => r.json()),
    ]).then(([o, c]) => { setOrgs(o); setContacts(c); }).catch(() => {});
  }, []);

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      const proposal = await res.json();
      router.push(`/app/proposals/${proposal.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSaving(false);
    }
  }

  const field: React.CSSProperties = { width: "100%", fontFamily: "var(--font-mono)", fontSize: "0.78rem", padding: "0.5rem 0.6rem", background: "var(--warm)", border: "1px solid var(--rule)", borderRadius: "2px", color: "var(--soil)", outline: "none", boxSizing: "border-box" };
  const lbl: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: "0.60rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--sage)", display: "block", marginBottom: "0.3rem" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 52px)" }}>
      <AppSidebar />
      <div style={{ padding: "1.5rem 2rem", maxWidth: "640px" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/app/proposals" style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", color: "var(--sage)", textDecoration: "none" }}>← Proposals</Link>
          <h1 className="t-display-sm" style={{ marginTop: "0.5rem" }}>New proposal</h1>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={lbl}>Project title *</label>
            <input style={field} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Membership Portal Redesign" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={lbl}>Company</label>
              <select style={field} value={form.orgId} onChange={e => set("orgId", e.target.value)}>
                <option value="">— none —</option>
                {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Contact</label>
              <select style={field} value={form.contactId} onChange={e => set("contactId", e.target.value)}>
                <option value="">— none —</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={lbl}>Hourly rate ($)</label>
              <input type="number" style={field} value={form.ratePerHour} onChange={e => set("ratePerHour", e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Valid until</label>
              <input type="date" style={field} value={form.expiresAt} onChange={e => set("expiresAt", e.target.value)} />
            </div>
          </div>

          <div>
            <label style={lbl}>Project description</label>
            <textarea
              style={{ ...field, resize: "vertical", minHeight: "100px" }}
              value={form.projectDesc}
              onChange={e => set("projectDesc", e.target.value)}
              placeholder="Describe what the client needs, the problem being solved, any context on their situation. This feeds the AI cover letter."
            />
          </div>

          {error && <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--status-block)" }}>{error}</p>}

          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
            <button type="submit" disabled={saving} className="btn btn-solid" style={{ padding: "0.5rem 1.25rem" }}>
              {saving ? "Creating…" : "Create proposal"}
            </button>
            <Link href="/app/proposals" className="btn btn-ghost" style={{ padding: "0.5rem 1.25rem" }}>Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
