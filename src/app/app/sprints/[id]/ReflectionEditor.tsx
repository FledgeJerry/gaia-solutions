"use client";

import { useState } from "react";

export default function ReflectionEditor({ sprintId, initialReflection }: { sprintId: string; initialReflection: string | null }) {
  const [text, setText] = useState(initialReflection ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch(`/api/sprints/${sprintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reflection: text }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const dirty = text !== (initialReflection ?? "");

  return (
    <div style={{ border: "1px solid var(--rule)", background: "var(--warm-white)", padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
        <p className="t-label">Retro — how did this sprint go?</p>
        {saved && <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#2e7d32" }}>✓ Saved</span>}
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What went well, what didn't, what to change next sprint…"
        style={{
          width: "100%", minHeight: "160px", resize: "vertical", boxSizing: "border-box",
          padding: "0.6rem 0.75rem", border: "1px solid var(--rule)", borderRadius: "2px",
          background: "var(--warm-white)", color: "var(--ink)", fontSize: "0.85rem", lineHeight: 1.5,
        }}
      />
      <div style={{ marginTop: "0.75rem" }}>
        <button onClick={save} disabled={saving || !dirty} className="btn btn-solid" style={{ padding: "0.4rem 1rem", opacity: dirty ? 1 : 0.5 }}>
          {saving ? "Saving…" : "Save reflection"}
        </button>
      </div>
    </div>
  );
}
