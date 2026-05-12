"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppSidebar from "@/components/AppSidebar";

const STORY_TYPES = ["CLIENT", "PARTNER", "INTERNAL", "OPEN_SOURCE", "INVESTIGATION", "GOVERNANCE"] as const;
const STATUSES = ["BACKLOG", "SPRINT", "IN_PROGRESS", "REVIEW", "DONE"] as const;

type Org = { id: string; name: string };
type Contact = { id: string; name: string };

export default function NewStoryPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "", type: "INTERNAL", status: "BACKLOG", points: "1", orgId: "", contactId: "",
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
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const text = await res.text();
        let msg = "Failed";
        try { msg = JSON.parse(text).error || msg; } catch { msg = text || msg; }
        throw new Error(msg);
      }
      router.push("/app/board");
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
          <Link href="/app/board" style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", color: "#888", textDecoration: "none" }}>← Board</Link>
          <h1 className="t-display-sm" style={{ marginTop: "0.5rem" }}>Add story</h1>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={lbl}>Title *</label>
            <input style={field} value={form.title} onChange={e => set("title", e.target.value)} placeholder="What needs to happen?" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={lbl}>Type</label>
              <select style={field} value={form.type} onChange={e => set("type", e.target.value)}>
                {STORY_TYPES.map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Status</label>
              <select style={field} value={form.status} onChange={e => set("status", e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={lbl}>Points</label>
            <input type="number" min="1" max="13" style={{ ...field, width: "80px" }} value={form.points} onChange={e => set("points", e.target.value)} />
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

          {error && <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--red)" }}>{error}</p>}

          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
            <button type="submit" disabled={saving} className="btn btn-solid" style={{ padding: "0.5rem 1.25rem" }}>
              {saving ? "Saving…" : "Add story"}
            </button>
            <Link href="/app/board" className="btn" style={{ padding: "0.5rem 1.25rem" }}>Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
