import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import AppSidebar from "@/components/AppSidebar";
import EditCompanyForm from "./EditCompanyForm";

const TYPE_COLORS: Record<string, string> = {
  CLIENT: "var(--gold)", PARTNER: "#6BA3BE", FUNDER: "#7CB87C",
  PRESS: "#B87CB8", COMMUNITY: "#aaa", ECOSYSTEM: "#BE9A6B",
};

function daysSince(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const org = await prisma.org.findUnique({
    where: { id },
    include: {
      contacts: { orderBy: { lastTouchedAt: "desc" } },
      stories: { orderBy: { updatedAt: "desc" }, take: 20 },
    },
  });

  if (!org) notFound();

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 52px)" }}>
      <AppSidebar />

      <div style={{ padding: "1.5rem 2rem" }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <Link href="/app/companies" style={{ ...mono, fontSize: "0.60rem", color: "#888", textDecoration: "none" }}>← Companies</Link>
        </div>

        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", border: "1px solid var(--rule)", background: "var(--warm-white)", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.3rem" }}>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--ink)" }}>{org.name}</h1>
              <span style={{ ...mono, fontSize: "0.58rem", color: TYPE_COLORS[org.type] ?? "#aaa", letterSpacing: "0.08em" }}>{org.type}</span>
            </div>
            {org.website && (
              <a href={org.website} target="_blank" rel="noopener noreferrer" style={{ ...mono, fontSize: "0.68rem", color: "#888", textDecoration: "none" }}>
                {org.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            {org.notes && <p style={{ fontSize: "0.80rem", color: "#666", marginTop: "0.5rem", lineHeight: 1.5 }}>{org.notes}</p>}
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ ...mono, fontSize: "0.58rem", color: "#aaa", letterSpacing: "0.08em" }}>CONTACTS</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--ink)" }}>{org.contacts.length}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
          {/* Left: contacts + stories */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Contacts */}
            <div style={{ border: "1px solid var(--rule)", background: "var(--warm-white)" }}>
              <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "#555" }}>Contacts ({org.contacts.length})</p>
                <Link href={`/app/crm/new`} style={{ ...mono, fontSize: "0.60rem", color: "#888", textDecoration: "none" }}>+ Add</Link>
              </div>
              {org.contacts.length === 0 ? (
                <p style={{ ...mono, fontSize: "0.70rem", color: "#aaa", padding: "1.25rem", textAlign: "center" }}>No contacts yet.</p>
              ) : (
                <div>
                  {org.contacts.map((c, i) => {
                    const days = daysSince(c.lastTouchedAt);
                    return (
                      <div key={c.id} style={{ padding: "0.65rem 1.25rem", borderBottom: i < org.contacts.length - 1 ? "1px solid var(--rule)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <p style={{ fontSize: "0.80rem", fontWeight: 500, color: "var(--ink)" }}>{c.name}</p>
                          {c.role && <p style={{ ...mono, fontSize: "0.62rem", color: "#aaa" }}>{c.role}</p>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span style={{ ...mono, fontSize: "0.60rem", color: "#aaa" }}>
                            {days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days}d ago`}
                          </span>
                          <Link href={`/app/crm/${c.id}`} style={{ ...mono, fontSize: "0.60rem", color: "#888", textDecoration: "none" }}>→</Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Stories */}
            {org.stories.length > 0 && (
              <div style={{ border: "1px solid var(--rule)", background: "var(--warm-white)" }}>
                <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--rule)" }}>
                  <p style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "#555" }}>Projects ({org.stories.length})</p>
                </div>
                <div>
                  {org.stories.map((s, i) => (
                    <div key={s.id} style={{ padding: "0.65rem 1.25rem", borderBottom: i < org.stories.length - 1 ? "1px solid var(--rule)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontSize: "0.80rem", color: "var(--ink)" }}>{s.title}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {s.blocked && <span style={{ ...mono, fontSize: "0.55rem", color: "var(--red)" }}>BLOCKED</span>}
                        <span style={{ ...mono, fontSize: "0.58rem", color: "#aaa" }}>{s.status.replace("_", " ")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: edit form */}
          <div style={{ border: "1px solid var(--rule)", background: "var(--warm-white)" }}>
            <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--rule)" }}>
              <p style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "#555" }}>Edit company</p>
            </div>
            <div style={{ padding: "1rem 1.25rem" }}>
              <EditCompanyForm org={org} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
