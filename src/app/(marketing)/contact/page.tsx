export default function ContactPage() {
  return (
    <>
      <section className="page-pad section-pad">
        <div className="section-header">
          <span className="section-num">Contact</span>
          <h1 className="section-title">Start a project</h1>
          <p className="section-dek">We respond to every serious inquiry.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", maxWidth: "900px" }}>
          <div>
            <p className="t-body" style={{ color: "#555", marginBottom: "1.5rem" }}>Tell us what you&apos;re building — or tearing down. We&apos;ll tell you honestly whether we&apos;re the right fit.</p>
            <p className="t-body" style={{ color: "#555", marginBottom: "2rem" }}>Sliding scale for mutual aid and co-ops. Full rate for institutions that can afford it.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <a href="mailto:hello@gaia.solutions" style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--ink)", textDecoration: "none" }}>hello@gaia.solutions</a>
              <a href="https://thefledge.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "#888", textDecoration: "none" }}>thefledge.com — 1300 Eureka Street, Lansing MI</a>
            </div>
          </div>
          <div style={{ background: "var(--warm-white)", border: "1px solid var(--rule)", padding: "2rem" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#999", marginBottom: "1.5rem" }}>Contact form coming soon</p>
            <p className="t-body-sm" style={{ color: "#777" }}>For now, email us directly at <a href="mailto:hello@gaia.solutions" style={{ color: "var(--ink)" }}>hello@gaia.solutions</a> with a brief description of your project and timeline.</p>
          </div>
        </div>
      </section>
    </>
  );
}
