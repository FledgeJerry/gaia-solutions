"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppSidebar from "@/components/AppSidebar";

function todayStr() { return new Date().toISOString().slice(0, 10); }
function twoWeeksOutStr() {
  const d = new Date();
  d.setDate(d.getDate() + 13);
  return d.toISOString().slice(0, 10);
}

export default function NewSprintForm({ nextNumber }: { nextNumber: number }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    number: String(nextNumber),
    startDate: todayStr(),
    endDate: twoWeeksOutStr(),
    focus: "",
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/sprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      router.push("/app/sprints");
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
          <Link href="/app/sprints" style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", color: "#888", textDecoration: "none" }}>← Sprints</Link>
          <h1 className="t-display-sm" style={{ marginTop: "0.5rem" }}>New sprint</h1>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={lbl}>Sprint number *</label>
            <input type="number" min="1" style={{ ...field, width: "100px" }} value={form.number} onChange={e => set("number", e.target.value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={lbl}>Start date *</label>
              <input type="date" style={field} value={form.startDate} onChange={e => set("startDate", e.target.value)} />
            </div>
            <div>
              <label style={lbl}>End date *</label>
              <input type="date" style={field} value={form.endDate} onChange={e => set("endDate", e.target.value)} />
            </div>
          </div>

          <div>
            <label style={lbl}>Focus (optional)</label>
            <input style={field} value={form.focus} onChange={e => set("focus", e.target.value)} placeholder="What's this sprint about?" />
          </div>

          {error && <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--red)" }}>{error}</p>}

          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
            <button type="submit" disabled={saving} className="btn btn-solid" style={{ padding: "0.5rem 1.25rem" }}>
              {saving ? "Saving…" : "Create sprint"}
            </button>
            <Link href="/app/sprints" className="btn" style={{ padding: "0.5rem 1.25rem" }}>Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
