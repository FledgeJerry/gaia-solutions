"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppSidebar from "@/components/AppSidebar";

type Org = { id: string; name: string; type: string };

export default function NewContactPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    orgId: "",
    role: "",
    email: "",
    phone: "",
    howWeMet: "",
    contextNote: "",
    decisionMaker: false,
  });

  useEffect(() => {
    fetch("/api/orgs").then(r => r.json()).then(setOrgs).catch(() => {});
  }, []);

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      const contact = await res.json();
      router.push(`/app/crm/${contact.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSaving(false);
    }
  }

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    fontFamily: "var(--font-mono)",
    fontSize: "0.78rem",
    padding: "0.5rem 0.6rem",
    background: "var(--warm-white)",
    border: "1px solid var(--rule)",
    borderRadius: "2px",
    color: "var(--ink)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.60rem",
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    color: "#666",
    display: "block",
    marginBottom: "0.3rem",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 52px)" }}>
      <AppSidebar />

      <div style={{ padding: "1.5rem 2rem", maxWidth: "640px" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/app/crm" style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", color: "#888", textDecoration: "none" }}>← Contacts</Link>
          <h1 className="t-display-sm" style={{ marginTop: "0.5rem" }}>Add contact</h1>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <div>
            <label style={labelStyle}>Name *</label>
            <input style={fieldStyle} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Full name" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Organization</label>
              <select style={fieldStyle} value={form.orgId} onChange={e => set("orgId", e.target.value)}>
                <option value="">— none —</option>
                {orgs.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Role / Title</label>
              <input style={fieldStyle} value={form.role} onChange={e => set("role", e.target.value)} placeholder="e.g. Executive Director" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" style={fieldStyle} value={form.email} onChange={e => set("email", e.target.value)} placeholder="name@example.com" />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={fieldStyle} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(555) 000-0000" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>How we met</label>
            <input style={fieldStyle} value={form.howWeMet} onChange={e => set("howWeMet", e.target.value)} placeholder="e.g. Lansing meetup, Jan 2026" />
          </div>

          <div>
            <label style={labelStyle}>Context note</label>
            <textarea
              style={{ ...fieldStyle, resize: "vertical", minHeight: "80px" }}
              value={form.contextNote}
              onChange={e => set("contextNote", e.target.value)}
              placeholder="Anything useful to remember about this person…"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <input
              type="checkbox"
              id="dm"
              checked={form.decisionMaker}
              onChange={e => set("decisionMaker", e.target.checked)}
              style={{ accentColor: "var(--gold)", width: "14px", height: "14px" }}
            />
            <label htmlFor="dm" style={{ ...labelStyle, marginBottom: 0, cursor: "pointer" }}>Decision maker</label>
          </div>

          {error && (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--red)" }}>{error}</p>
          )}

          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
            <button type="submit" disabled={saving} className="btn btn-solid" style={{ padding: "0.5rem 1.25rem" }}>
              {saving ? "Saving…" : "Add contact"}
            </button>
            <Link href="/app/crm" className="btn" style={{ padding: "0.5rem 1.25rem" }}>Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
