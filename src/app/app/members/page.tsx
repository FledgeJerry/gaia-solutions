"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Contact = { id: string; name: string; role: string | null; org: { name: string } | null } | null;
type Member = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  contactId: string | null;
  contact: Contact;
};

const ROLES = ["MEMBER", "ADMIN", "CLIENT"] as const;

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "pill-amber",
  MEMBER: "pill-green",
  CLIENT: "pill-blue",
  USER: "pill-gray",
};

export default function MembersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.role !== "ADMIN") { router.replace("/app/crm"); return; }
    Promise.all([
      fetch("/api/members").then(r => r.json()),
      fetch("/api/contacts").then(r => r.json()),
    ]).then(([m, c]) => {
      setMembers(m);
      setContacts(c);
    }).finally(() => setLoading(false));
  }, [session, status, router]);

  async function patch(id: string, data: { role?: string; contactId?: string | null }) {
    setSaving(id);
    const res = await fetch(`/api/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
    }
    setSaving(null);
  }

  const inp: React.CSSProperties = {
    background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: "4px",
    padding: "0.35rem 0.6rem", fontFamily: "var(--font-mono)", fontSize: "0.72rem",
    color: "var(--soil)", outline: "none",
  };

  if (loading) return <div style={{ padding: "2rem", fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--sage)" }}>Loading…</div>;

  const unlinkedContacts = contacts.filter(c => !members.some(m => m.contactId === c.id));

  return (
    <div style={{ padding: "2rem", maxWidth: "900px" }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "0.3rem" }}>Admin</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "var(--moss)", marginBottom: "0.4rem" }}>Team members</h1>
        <p style={{ fontSize: "0.85rem", color: "var(--bark)", fontWeight: 300 }}>
          Manage roles and link accounts to CRM contacts. New signups with a matching email are linked automatically.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--rule)", border: "1px solid var(--rule)", borderRadius: "4px", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 200px 32px", gap: "1rem", padding: "0.5rem 1rem", background: "#E8EDE4" }}>
          {["Member", "Role", "Linked contact", ""].map(h => (
            <span key={h} style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--moss)" }}>{h}</span>
          ))}
        </div>

        {members.map(m => (
          <div key={m.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 200px 32px", gap: "1rem", padding: "0.75rem 1rem", background: "var(--warm)", alignItems: "center" }}>
            {/* Name + email */}
            <div>
              <p style={{ fontWeight: 500, fontSize: "0.88rem", color: "var(--soil)", marginBottom: "0.1rem" }}>{m.name ?? "—"}</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--sage)" }}>{m.email}</p>
              {m.contact && (
                <p style={{ fontSize: "0.72rem", color: "var(--bark)", fontWeight: 300, marginTop: "0.2rem" }}>
                  {m.contact.role ?? ""}{m.contact.org ? ` @ ${m.contact.org.name}` : ""}
                </p>
              )}
            </div>

            {/* Role */}
            <select
              style={inp}
              value={m.role}
              disabled={saving === m.id}
              onChange={e => patch(m.id, { role: e.target.value })}
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              {m.role === "USER" && <option value="USER">USER (legacy)</option>}
            </select>

            {/* Contact link */}
            <select
              style={inp}
              value={m.contactId ?? ""}
              disabled={saving === m.id}
              onChange={e => patch(m.id, { contactId: e.target.value || null })}
            >
              <option value="">— not linked —</option>
              {m.contact && <option value={m.contact.id}>{m.contact.name}</option>}
              {unlinkedContacts.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Status indicator */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              {saving === m.id ? (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--sage)" }}>…</span>
              ) : (
                <span className={`pill ${ROLE_BADGE[m.role] ?? "pill-gray"}`} style={{ fontSize: "0.55rem" }}>✓</span>
              )}
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--sage)" }}>
            No accounts yet.
          </div>
        )}
      </div>

      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--sage)", marginTop: "1rem" }}>
        {members.length} account{members.length !== 1 ? "s" : ""} · Changes save instantly
      </p>
    </div>
  );
}
