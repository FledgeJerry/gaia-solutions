import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import AppSidebar from "@/components/AppSidebar";
import InteractionForm from "./InteractionForm";
import EditContactForm from "./EditContactForm";

function warmthLabel(score: number) {
  if (score >= 70) return { label: "Hot", color: "var(--red)" };
  if (score >= 40) return { label: "Warm", color: "var(--gold)" };
  if (score >= 15) return { label: "Cool", color: "#aaa" };
  return { label: "Cold", color: "#ddd" };
}

function calcWarmth(lastTouched: Date) {
  const days = Math.floor((Date.now() - lastTouched.getTime()) / 86400000);
  if (days <= 3) return 85;
  if (days <= 14) return 55;
  if (days <= 30) return 25;
  return 5;
}

function relDate(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const INTERACTION_LABELS: Record<string, string> = {
  CALL: "Call",
  MEETING: "Meeting",
  EMAIL: "Email",
  EVENT: "Event",
  PROPOSAL: "Proposal",
  OTHER: "Note",
};

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      org: true,
      interactions: { orderBy: { createdAt: "desc" }, include: { loggedBy: { select: { name: true } } } },
      stories: { orderBy: { updatedAt: "desc" } },
    },
  });

  if (!contact) notFound();

  const warmth = calcWarmth(contact.lastTouchedAt);
  const { label: warmthLbl, color: warmthColor } = warmthLabel(warmth);

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  const labelCss: React.CSSProperties = { ...mono, fontSize: "0.58rem", letterSpacing: "0.10em", textTransform: "uppercase" as const, color: "#888" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 52px)" }}>
      <AppSidebar />

      {/* Main */}
      <div style={{ padding: "1.5rem 2rem" }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <Link href="/app/crm" style={{ ...mono, fontSize: "0.60rem", color: "#888", textDecoration: "none" }}>← Contacts</Link>
        </div>

        {/* Header card */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "2rem", alignItems: "start", padding: "1.25rem 1.5rem", border: "1px solid var(--rule)", background: "var(--warm-white)", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.3rem" }}>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--ink)" }}>{contact.name}</h1>
              {contact.decisionMaker && (
                <span style={{ ...mono, fontSize: "0.55rem", background: "var(--gold)", color: "#000", padding: "0.15rem 0.4rem", borderRadius: "2px", letterSpacing: "0.08em" }}>DM</span>
              )}
            </div>
            {(contact.role || contact.org) && (
              <p style={{ fontSize: "0.80rem", color: "#666", marginBottom: "0.2rem" }}>
                {contact.role}{contact.role && contact.org ? " · " : ""}{contact.org?.name}
              </p>
            )}
            <div style={{ display: "flex", gap: "1.25rem", marginTop: "0.6rem", flexWrap: "wrap" }}>
              {contact.email && <a href={`mailto:${contact.email}`} style={{ ...mono, fontSize: "0.68rem", color: "#666", textDecoration: "none" }}>{contact.email}</a>}
              {contact.phone && <span style={{ ...mono, fontSize: "0.68rem", color: "#666" }}>{contact.phone}</span>}
              {contact.howWeMet && <span style={{ ...mono, fontSize: "0.68rem", color: "#aaa" }}>Met: {contact.howWeMet}</span>}
            </div>
          </div>

          {/* Warmth */}
          <div style={{ textAlign: "right" }}>
            <p style={labelCss}>Warmth</p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.3rem" }}>
              <div style={{ width: "80px", height: "6px", background: "var(--rule)", borderRadius: "3px" }}>
                <div style={{ width: `${warmth}%`, height: "6px", background: warmthColor, borderRadius: "3px" }} />
              </div>
              <span style={{ ...mono, fontSize: "0.68rem", color: warmthColor, fontWeight: 600 }}>{warmthLbl}</span>
            </div>
            <p style={{ ...mono, fontSize: "0.58rem", color: "#aaa", marginTop: "0.3rem" }}>
              Last touch: {relDate(contact.lastTouchedAt)}
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
          {/* Left col */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Context note */}
            {contact.contextNote && (
              <div style={{ padding: "1rem 1.25rem", border: "1px solid var(--rule)", background: "#FAFAF8" }}>
                <p style={labelCss}>Context</p>
                <p style={{ fontSize: "0.82rem", color: "var(--ink)", marginTop: "0.4rem", lineHeight: 1.5 }}>{contact.contextNote}</p>
              </div>
            )}

            {/* Log interaction */}
            <div style={{ border: "1px solid var(--rule)", background: "var(--warm-white)" }}>
              <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--rule)" }}>
                <p style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "#555" }}>Log interaction</p>
              </div>
              <div style={{ padding: "1rem 1.25rem" }}>
                <InteractionForm contactId={contact.id} />
              </div>
            </div>

            {/* Interaction timeline */}
            <div style={{ border: "1px solid var(--rule)", background: "var(--warm-white)" }}>
              <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--rule)" }}>
                <p style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "#555" }}>Timeline ({contact.interactions.length})</p>
              </div>
              {contact.interactions.length === 0 ? (
                <p style={{ ...mono, fontSize: "0.70rem", color: "#aaa", padding: "1.25rem", textAlign: "center" }}>No interactions yet.</p>
              ) : (
                <div>
                  {contact.interactions.map((ix, i) => (
                    <div key={ix.id} style={{ padding: "0.75rem 1.25rem", borderBottom: i < contact.interactions.length - 1 ? "1px solid var(--rule)" : "none", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "0.75rem", alignItems: "start" }}>
                      <span style={{ ...mono, fontSize: "0.58rem", background: "var(--field)", padding: "0.2rem 0.4rem", borderRadius: "2px", color: "#555", whiteSpace: "nowrap", marginTop: "0.1rem" }}>
                        {INTERACTION_LABELS[ix.type] ?? ix.type}
                      </span>
                      <div>
                        {ix.notes ? (
                          <p style={{ fontSize: "0.78rem", color: "var(--ink)", lineHeight: 1.45 }}>{ix.notes}</p>
                        ) : (
                          <p style={{ fontSize: "0.78rem", color: "#aaa", fontStyle: "italic" }}>No notes</p>
                        )}
                        {ix.loggedBy && (
                          <p style={{ ...mono, fontSize: "0.58rem", color: "#aaa", marginTop: "0.2rem" }}>by {ix.loggedBy.name}</p>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ ...mono, fontSize: "0.60rem", color: "#aaa", whiteSpace: "nowrap" }}>{relDate(ix.createdAt)}</span>
                        {ix.meaningful && <p style={{ ...mono, fontSize: "0.55rem", color: "var(--gold)", marginTop: "0.15rem" }}>★</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right col */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Edit */}
            <div style={{ border: "1px solid var(--rule)", background: "var(--warm-white)" }}>
              <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--rule)" }}>
                <p style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "#555" }}>Edit contact</p>
              </div>
              <div style={{ padding: "1rem 1.25rem" }}>
                <EditContactForm contact={contact} />
              </div>
            </div>

            {/* Linked stories */}
            {contact.stories.length > 0 && (
              <div style={{ border: "1px solid var(--rule)", background: "var(--warm-white)" }}>
                <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--rule)" }}>
                  <p style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "#555" }}>Linked projects ({contact.stories.length})</p>
                </div>
                <div>
                  {contact.stories.map((s, i) => (
                    <div key={s.id} style={{ padding: "0.6rem 1.25rem", borderBottom: i < contact.stories.length - 1 ? "1px solid var(--rule)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontSize: "0.78rem", color: "var(--ink)" }}>{s.title}</p>
                      <span style={{ ...mono, fontSize: "0.58rem", color: "#aaa" }}>{s.status.replace("_", " ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
