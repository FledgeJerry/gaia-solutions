"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ORG_TYPES = ["CLIENT", "PARTNER", "FUNDER", "PRESS", "COMMUNITY", "ECOSYSTEM"] as const;

type Org = { id: string; name: string; type: string; website: string | null; notes: string | null };

export default function EditCompanyForm({ org }: { org: Org }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: org.name,
    type: org.type,
    website: org.website ?? "",
    notes: org.notes ?? "",
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/orgs/${org.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  const field: React.CSSProperties = {
    fontFamily: "var(--font-mono)", fontSize: "0.75rem", padding: "0.45rem 0.6rem",
    background: "var(--field)", border: "1px solid var(--field-border)", borderRadius: "2px",
    color: "var(--ink)", outline: "none", width: "100%", boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    fontFamily: "var(--font-mono)", fontSize: "0.56rem", letterSpacing: "0.10em",
    textTransform: "uppercase" as const, color: "#888", display: "block", marginBottom: "0.25rem",
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div>
        <label style={lbl}>Name</label>
        <input style={field} value={form.name} onChange={e => set("name", e.target.value)} />
      </div>
      <div>
        <label style={lbl}>Type</label>
        <select style={field} value={form.type} onChange={e => set("type", e.target.value)}>
          {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label style={lbl}>Website</label>
        <input style={field} value={form.website} onChange={e => set("website", e.target.value)} />
      </div>
      <div>
        <label style={lbl}>Notes</label>
        <textarea style={{ ...field, resize: "vertical", minHeight: "60px" }} value={form.notes} onChange={e => set("notes", e.target.value)} />
      </div>
      <button type="submit" disabled={saving} className="btn btn-solid" style={{ padding: "0.35rem 0.9rem", fontSize: "0.72rem", width: "100%" }}>
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
      </button>
    </form>
  );
}
