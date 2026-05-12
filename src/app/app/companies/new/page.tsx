"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppSidebar from "@/components/AppSidebar";

const ORG_TYPES = ["CLIENT", "PARTNER", "FUNDER", "PRESS", "COMMUNITY", "ECOSYSTEM"] as const;

export default function NewCompanyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", type: "CLIENT", website: "", notes: "" });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      const org = await res.json();
      router.push(`/app/companies/${org.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSaving(false);
    }
  }

  const field: React.CSSProperties = {
    width: "100%", fontFamily: "var(--font-mono)", fontSize: "0.78rem",
    padding: "0.5rem 0.6rem", background: "var(--warm-white)", border: "1px solid var(--rule)",
    borderRadius: "2px", color: "var(--ink)", outline: "none", boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    fontFamily: "var(--font-mono)", fontSize: "0.60rem", letterSpacing: "0.10em",
    textTransform: "uppercase", color: "#666", display: "block", marginBottom: "0.3rem",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 52px)" }}>
      <AppSidebar />

      <div style={{ padding: "1.5rem 2rem", maxWidth: "560px" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/app/companies" style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", color: "#888", textDecoration: "none" }}>← Companies</Link>
          <h1 className="t-display-sm" style={{ marginTop: "0.5rem" }}>Add company</h1>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={lbl}>Name *</label>
            <input style={field} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Organization name" />
          </div>

          <div>
            <label style={lbl}>Type</label>
            <select style={field} value={form.type} onChange={e => set("type", e.target.value)}>
              {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label style={lbl}>Website</label>
            <input style={field} value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://example.com" />
          </div>

          <div>
            <label style={lbl}>Notes</label>
            <textarea style={{ ...field, resize: "vertical", minHeight: "80px" }} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Anything useful…" />
          </div>

          {error && <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--red)" }}>{error}</p>}

          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
            <button type="submit" disabled={saving} className="btn btn-solid" style={{ padding: "0.5rem 1.25rem" }}>
              {saving ? "Saving…" : "Add company"}
            </button>
            <Link href="/app/companies" className="btn" style={{ padding: "0.5rem 1.25rem" }}>Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
