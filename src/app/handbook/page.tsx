"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { HANDBOOK } from "@/lib/handbook-content";
import type { HandbookField } from "@/lib/handbook-content";

type Entries = Record<string, string>;
type SaveState = Record<string, "saving" | "saved" | "error">;

export default function HandbookPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<Entries>({});
  const [saveState, setSaveState] = useState<SaveState>({});
  const [activeSection, setActiveSection] = useState(HANDBOOK[0].id);
  const [showExample, setShowExample] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;
    fetch("/api/handbook")
      .then((r) => r.json())
      .then((data: { fieldId: string; value: string }[]) => {
        const map: Entries = {};
        for (const e of data) map[e.fieldId] = e.value;
        setEntries(map);
        setLoading(false);
      });
  }, [status, router]);

  const save = useCallback(async (fieldId: string, value: string) => {
    setSaveState((s) => ({ ...s, [fieldId]: "saving" }));
    try {
      await fetch("/api/handbook", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldId, value }),
      });
      setSaveState((s) => ({ ...s, [fieldId]: "saved" }));
      setTimeout(() => setSaveState((s) => { const n = { ...s }; delete n[fieldId]; return n; }), 2000);
    } catch {
      setSaveState((s) => ({ ...s, [fieldId]: "error" }));
    }
  }, []);

  function handleChange(fieldId: string, value: string) {
    setEntries((e) => ({ ...e, [fieldId]: value }));
  }

  function handleBlur(fieldId: string) {
    save(fieldId, entries[fieldId] ?? "");
  }

  const section = HANDBOOK.find((s) => s.id === activeSection) ?? HANDBOOK[0];
  const completedInSection = section.fields.filter((f) => entries[f.id]?.trim()).length;

  if (status === "loading" || loading) return <p className="text-muted">Loading your handbook…</p>;

  return (
    <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>

      {/* Sidebar */}
      <aside style={{
        width: "220px",
        flexShrink: 0,
        position: "sticky",
        top: "80px",
      }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "0.75rem" }}>
          Sections
        </p>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {HANDBOOK.map((s) => {
            const done = s.fields.filter((f) => entries[f.id]?.trim()).length;
            const isActive = s.id === activeSection;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                style={{
                  background: isActive ? "var(--color-surface-raised)" : "transparent",
                  border: isActive ? "1px solid var(--color-border-strong)" : "1px solid transparent",
                  borderRadius: "6px",
                  padding: "0.5rem 0.75rem",
                  textAlign: "left",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: isActive ? "var(--color-dome-gold)" : "var(--color-text-muted)", display: "block" }}>
                  {s.id}
                </span>
                <span style={{ fontSize: "0.8rem", color: isActive ? "var(--color-limestone)" : "var(--color-text-secondary)", display: "block", lineHeight: 1.3 }}>
                  {s.title.split(":")[0]}
                </span>
                <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "0.2rem", display: "block" }}>
                  {done}/{s.fields.length} fields
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: "2rem" }}>
          <span className="eyebrow">{section.id}</span>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{section.title}</h1>
          <p style={{ marginBottom: "0.5rem" }}>{section.description}</p>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
            {completedInSection} of {section.fields.length} fields completed
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {section.fields.map((field: HandbookField) => (
            <div key={field.id} className="card" id={field.id}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                <span className="badge badge--gold">{field.id}</span>
                <span className={`badge ${field.type === "N" ? "badge--blue" : "badge--teal"}`}>
                  {field.type === "N" ? "Narrative" : "Numeric"}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  Feeds into: {field.feedsInto.join(", ")}
                </span>
              </div>

              <label htmlFor={field.id} style={{ color: "var(--color-limestone)", fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem", display: "block" }}>
                {field.question}
              </label>

              {field.multiline ? (
                <textarea
                  id={field.id}
                  value={entries[field.id] ?? ""}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  onBlur={() => handleBlur(field.id)}
                  placeholder="Your answer…"
                  rows={4}
                />
              ) : (
                <input
                  id={field.id}
                  type="text"
                  value={entries[field.id] ?? ""}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  onBlur={() => handleBlur(field.id)}
                  placeholder="Your answer…"
                />
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowExample((s) => ({ ...s, [field.id]: !s[field.id] }))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-sans)", padding: 0 }}
                >
                  {showExample[field.id] ? "Hide example" : "Show example"}
                </button>
                {saveState[field.id] === "saving" && (
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Saving…</span>
                )}
                {saveState[field.id] === "saved" && (
                  <span style={{ fontSize: "0.75rem", color: "var(--color-teal-accent)" }}>Saved</span>
                )}
                {saveState[field.id] === "error" && (
                  <span style={{ fontSize: "0.75rem", color: "#e07070" }}>Error saving</span>
                )}
              </div>

              {showExample[field.id] && (
                <div style={{ marginTop: "0.75rem", padding: "0.75rem 1rem", background: "var(--color-surface-raised)", borderRadius: "6px", borderLeft: "3px solid var(--color-river-blue)" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-river-blue)", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Neighbors Care Cooperative example
                  </p>
                  <p style={{ fontSize: "0.875rem", margin: 0 }}>{field.example}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
