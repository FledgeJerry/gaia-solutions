"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TYPES = ["CALL", "MEETING", "EMAIL", "EVENT", "PROPOSAL", "OTHER"] as const;
const TYPE_LABELS: Record<string, string> = {
  CALL: "Call", MEETING: "Meeting", EMAIL: "Email", EVENT: "Event", PROPOSAL: "Proposal", OTHER: "Note",
};

export default function InteractionForm({ contactId }: { contactId: string }) {
  const router = useRouter();
  const [type, setType] = useState("MEETING");
  const [notes, setNotes] = useState("");
  const [meaningful, setMeaningful] = useState(false);
  const [saving, setSaving] = useState(false);

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  const field: React.CSSProperties = { ...mono, fontSize: "0.75rem", padding: "0.45rem 0.6rem", background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: "2px", color: "var(--soil)", outline: "none", width: "100%", boxSizing: "border-box" };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/contacts/${contactId}/interactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, notes, meaningful }),
    });
    setNotes("");
    setMeaningful(false);
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div>
        <select style={field} value={type} onChange={e => setType(e.target.value)}>
          {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
      </div>
      <div>
        <textarea
          style={{ ...field, resize: "vertical", minHeight: "64px" }}
          placeholder="What happened? Key decisions, next steps…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
          <input type="checkbox" checked={meaningful} onChange={e => setMeaningful(e.target.checked)} style={{ accentColor: "var(--gold)" }} />
          <span style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#666" }}>Meaningful</span>
        </label>
        <button type="submit" disabled={saving} className="btn btn-solid" style={{ padding: "0.35rem 0.9rem", fontSize: "0.72rem" }}>
          {saving ? "…" : "Log"}
        </button>
      </div>
    </form>
  );
}
