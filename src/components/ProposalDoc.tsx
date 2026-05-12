"use client";

type LineItem = { id: string; title: string; description: string | null; hours: number };
type Org = { name: string; website: string | null } | null;
type Contact = { name: string; email: string | null; role: string | null } | null;
type Proposal = {
  id: string; title: string; status: string; coverLetter: string | null; termsNote: string | null;
  ratePerHour: number; expiresAt: Date | null; sentAt: Date | null;
  org: Org; contact: Contact; items: LineItem[];
};

export default function ProposalDoc({ proposal }: { proposal: Proposal }) {
  const totalHours = proposal.items.reduce((s, i) => s + i.hours, 0);
  const totalCost = totalHours * proposal.ratePerHour;
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const mono: React.CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" };
  const sans: React.CSSProperties = { fontFamily: "'Archivo', system-ui, sans-serif" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:ital,wght@0,300;0,400;0,500;1,300&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F6F4EE; color: #2A1E0E; font-family: 'Archivo', sans-serif; }
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .page { box-shadow: none !important; }
        }
      `}</style>

      {/* Print/back bar */}
      <div className="no-print" style={{ background: "#1A2A1A", padding: "0.6rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...mono, fontSize: "0.65rem", color: "#A8C49A", letterSpacing: "0.10em" }}>gaia<span style={{ color: "#F0C040" }}>.</span>solutions — proposal preview</span>
        <button onClick={() => window.print()} style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase", background: "#C9921A", color: "#2A1E0E", border: "none", cursor: "pointer", padding: "0.35rem 0.9rem", fontWeight: 500 }}>
          Print / Save PDF
        </button>
      </div>

      <div className="page" style={{ maxWidth: "760px", margin: "2rem auto 4rem", background: "#fff", boxShadow: "0 2px 24px rgba(0,0,0,0.08)", padding: "3.5rem 4rem" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3rem", paddingBottom: "1.5rem", borderBottom: "2px solid #2D4A2D" }}>
          <div>
            <p style={{ ...mono, fontSize: "0.75rem", color: "#C9921A", letterSpacing: "0.10em", marginBottom: "0.25rem" }}>
              gaia<span style={{ color: "#F0C040" }}>.</span>solutions
            </p>
            <p style={{ ...sans, fontSize: "0.78rem", color: "#6B8F5E", fontWeight: 300 }}>Worker-owned software cooperative · Lansing, MI</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ ...mono, fontSize: "0.65rem", color: "#9E7C50" }}>{today}</p>
            {proposal.expiresAt && (
              <p style={{ ...mono, fontSize: "0.60rem", color: "#A8C49A", marginTop: "0.2rem" }}>
                Valid until {new Date(proposal.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
        </div>

        {/* To block */}
        {(proposal.org || proposal.contact) && (
          <div style={{ marginBottom: "2rem" }}>
            <p style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#A8C49A", marginBottom: "0.4rem" }}>Prepared for</p>
            {proposal.contact && <p style={{ ...sans, fontSize: "0.95rem", fontWeight: 500, color: "#2A1E0E" }}>{proposal.contact.name}{proposal.contact.role ? `, ${proposal.contact.role}` : ""}</p>}
            {proposal.org && <p style={{ ...sans, fontSize: "0.88rem", color: "#5C4A2A", fontWeight: 300 }}>{proposal.org.name}</p>}
            {proposal.contact?.email && <p style={{ ...mono, fontSize: "0.68rem", color: "#9E7C50", marginTop: "0.2rem" }}>{proposal.contact.email}</p>}
          </div>
        )}

        {/* Project title */}
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1.8rem", color: "#2D4A2D", lineHeight: 1.05, marginBottom: "2rem" }}>
          {proposal.title}
        </h1>

        {/* Cover letter */}
        {proposal.coverLetter && (
          <div style={{ marginBottom: "2.5rem" }}>
            {proposal.coverLetter.split("\n\n").filter(Boolean).map((para, i) => (
              <p key={i} style={{ ...sans, fontSize: "0.90rem", fontWeight: 300, lineHeight: 1.75, color: "#5C4A2A", marginBottom: "1rem" }}>
                {para}
              </p>
            ))}
          </div>
        )}

        {/* Scope + estimate */}
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#A8C49A", marginBottom: "0.75rem" }}>Scope of work & estimate</p>

          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px", gap: "1px", background: "#DDD9CE", border: "1px solid #DDD9CE", marginBottom: "1px" }}>
            {["Deliverable", "Hours", "Investment"].map(h => (
              <div key={h} style={{ background: "#E8EDE4", padding: "0.45rem 0.75rem" }}>
                <span style={{ ...mono, fontSize: "0.56rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "#6B8F5E" }}>{h}</span>
              </div>
            ))}
          </div>

          {/* Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#DDD9CE" }}>
            {proposal.items.map(item => (
              <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px", gap: "1px", background: "#DDD9CE" }}>
                <div style={{ background: "#FDFCF8", padding: "0.6rem 0.75rem" }}>
                  <p style={{ ...sans, fontSize: "0.82rem", fontWeight: 500, color: "#2A1E0E" }}>{item.title}</p>
                  {item.description && <p style={{ ...sans, fontSize: "0.75rem", fontWeight: 300, color: "#9E7C50", marginTop: "0.1rem" }}>{item.description}</p>}
                </div>
                <div style={{ background: "#FDFCF8", padding: "0.6rem 0.75rem", display: "flex", alignItems: "center" }}>
                  <span style={{ ...mono, fontSize: "0.75rem", color: "#2A1E0E" }}>{item.hours}h</span>
                </div>
                <div style={{ background: "#FDFCF8", padding: "0.6rem 0.75rem", display: "flex", alignItems: "center" }}>
                  <span style={{ ...mono, fontSize: "0.75rem", color: "#2A1E0E" }}>${(item.hours * proposal.ratePerHour).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px", background: "#2D4A2D", marginTop: "1px" }}>
            <div style={{ padding: "0.65rem 0.75rem" }}>
              <span style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "#A8C49A" }}>Total</span>
            </div>
            <div style={{ padding: "0.65rem 0.75rem" }}>
              <span style={{ ...mono, fontSize: "0.82rem", color: "#F0F7EC", fontWeight: 500 }}>{totalHours}h</span>
            </div>
            <div style={{ padding: "0.65rem 0.75rem" }}>
              <span style={{ ...mono, fontSize: "0.82rem", color: "#F0C040", fontWeight: 500 }}>${totalCost.toLocaleString()}</span>
            </div>
          </div>

          <p style={{ ...mono, fontSize: "0.60rem", color: "#A8C49A", marginTop: "0.5rem" }}>
            Rate: ${proposal.ratePerHour}/hr
          </p>
        </div>

        {/* Terms */}
        {proposal.termsNote && (
          <div style={{ borderTop: "1px solid #DDD9CE", paddingTop: "1.5rem", marginBottom: "2rem" }}>
            <p style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#A8C49A", marginBottom: "0.5rem" }}>Terms</p>
            <p style={{ ...sans, fontSize: "0.82rem", fontWeight: 300, color: "#5C4A2A", lineHeight: 1.7 }}>{proposal.termsNote}</p>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: "1px solid #DDD9CE", paddingTop: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ ...mono, fontSize: "0.58rem", color: "#A8C49A", letterSpacing: "0.06em" }}>gaia.solutions · hello@gaia.solutions</p>
          <p style={{ ...mono, fontSize: "0.58rem", color: "#DDD9CE" }}>worker-owned · lansing, mi</p>
        </div>
      </div>
    </>
  );
}
