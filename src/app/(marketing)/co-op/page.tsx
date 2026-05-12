import Link from "next/link";

export default function CoopPage() {
  return (
    <>
      <section className="page-pad section-pad">
        <div className="section-header">
          <span className="section-num">Co-op</span>
          <h1 className="section-title">What worker ownership means here</h1>
          <p className="section-dek">Not a metaphor. An actual legal structure.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", maxWidth: "900px" }}>
          <div>
            <h2 className="t-display-sm" style={{ marginBottom: "1rem" }}>Primus inter pares</h2>
            <p className="t-body" style={{ color: "#555", marginBottom: "1rem" }}>First among equals. Every co-op member — founders included — holds equal stakes, equal voice, and equal accountability. There is no shareholder class, no silent partner, no board that overrides the workers.</p>
            <p className="t-body" style={{ color: "#555" }}>We are a worker-owned LLC. The people doing the work own the business.</p>
          </div>
          <div>
            <h2 className="t-display-sm" style={{ marginBottom: "1rem" }}>How decisions get made</h2>
            <p className="t-body" style={{ color: "#555", marginBottom: "1rem" }}>Collectively, with binding agreements. Not consensus theater — real decisions with real accountability. When we commit, it holds.</p>
            <p className="t-body" style={{ color: "#555" }}>We use the same auditor's rigor on our own governance that we apply to client systems.</p>
          </div>
        </div>
      </section>

      <div className="manifesto-band">
        <p className="manifesto-headline">The solidarity economy<br />isn&apos;t a niche.<br />It&apos;s the alternative.</p>
        <p className="manifesto-sub">Worker ownership isn&apos;t a feel-good add-on. It&apos;s a structural claim about who should benefit from the value that workers create. We&apos;re building that claim into the legal architecture of this co-op.</p>
      </div>

      <section id="join" className="page-pad section-pad" style={{ background: "var(--fog)" }}>
        <div className="section-header">
          <span className="section-num">Join</span>
          <h2 className="section-title">How to join the collective</h2>
        </div>
        <div style={{ maxWidth: "600px" }}>
          <p className="t-body" style={{ color: "#555", marginBottom: "1.5rem" }}>The next member of this collective joins at equal standing. Same stakes, same voice, same accountability.</p>
          <ul style={{ listStyle: "none", marginBottom: "2rem" }}>
            {[
              "You bring a complementary discipline — journalism, law, design, domain expertise, or another technical area",
              "You're committed to worker ownership as a structural principle, not just a vibe",
              "You can make binding commitments and hold others to theirs",
              "You're building something — or want to",
            ].map(item => (
              <li key={item} style={{ display: "flex", gap: "0.75rem", padding: "0.75rem 0", borderBottom: "1px solid var(--rule)", fontSize: "0.88rem", fontWeight: 300, color: "#555" }}>
                <span style={{ color: "var(--gold)", flexShrink: 0 }}>→</span>
                {item}
              </li>
            ))}
          </ul>
          <Link href="/contact" className="btn btn-signal">Start a conversation about joining</Link>
        </div>
      </section>
    </>
  );
}
