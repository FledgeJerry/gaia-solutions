"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Org = { id: string; name: string };
type Contact = {
  id: string;
  name: string;
  orgId: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  howWeMet: string | null;
  contextNote: string | null;
  decisionMaker: boolean;
};

export default function EditContactForm({ contact }: { contact: Contact }) {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: contact.name,
    orgId: contact.orgId ?? "",
    role: contact.role ?? "",
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    howWeMet: contact.howWeMet ?? "",
    contextNote: contact.contextNote ?? "",
    decisionMaker: contact.decisionMaker,
  });

  useEffect(() => {
    fetch("/api/orgs").then(r => r.json()).then(setOrgs).catch(() => {});
  }, []);

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/contacts/${contact.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  const field: React.CSSProperties = { ...mono, fontSize: "0.75rem", padding: "0.45rem 0.6rem", background: "var(--field)", border: "1px solid var(--field-border)", borderRadius: "2px", color: "var(--ink)", outline: "none", width: "100%", boxSizing: "border-box" };
  const lbl: React.CSSProperties = { ...mono, fontSize: "0.56rem", letterSpacing: "0.10em", textTransform: "uppercase" as const, color: "#888", display: "block", marginBottom: "0.25rem" };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div>
        <label style={lbl}>Name</label>
        <input style={field} value={form.name} onChange={e => set("name", e.target.value)} />
      </div>
      <div>
        <label style={lbl}>Organization</label>
        <select style={field} value={form.orgId} onChange={e => set("orgId", e.target.value)}>
          <option value="">— none —</option>
          {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>
      <div>
        <label style={lbl}>Role</label>
        <input style={field} value={form.role} onChange={e => set("role", e.target.value)} />
      </div>
      <div>
        <label style={lbl}>Email</label>
        <input type="email" style={field} value={form.email} onChange={e => set("email", e.target.value)} />
      </div>
      <div>
        <label style={lbl}>Phone</label>
        <input style={field} value={form.phone} onChange={e => set("phone", e.target.value)} />
      </div>
      <div>
        <label style={lbl}>How we met</label>
        <input style={field} value={form.howWeMet} onChange={e => set("howWeMet", e.target.value)} />
      </div>
      <div>
        <label style={lbl}>Context note</label>
        <textarea style={{ ...field, resize: "vertical", minHeight: "60px" }} value={form.contextNote} onChange={e => set("contextNote", e.target.value)} />
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
        <input type="checkbox" checked={form.decisionMaker} onChange={e => set("decisionMaker", e.target.checked)} style={{ accentColor: "var(--gold)" }} />
        <span style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#666" }}>Decision maker</span>
      </label>
      <button type="submit" disabled={saving} className="btn btn-solid" style={{ padding: "0.35rem 0.9rem", fontSize: "0.72rem", width: "100%" }}>
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
      </button>
    </form>
  );
}
