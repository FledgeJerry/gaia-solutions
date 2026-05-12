import Link from "next/link";

export default function TeamPage() {
  return (
    <section className="page-pad section-pad">
      <div className="section-header">
        <span className="section-num">Team</span>
        <h1 className="section-title">The collective</h1>
        <p className="section-dek">Primus inter pares — first among equals.</p>
      </div>
      <div className="team-grid">
        <div className="team-card">
          <p className="team-role-tag">Co-founder · Systems & community</p>
          <h3 className="team-name">Jerry Norris</h3>
          <ul className="team-list">
            <li>ISO 9001 · Food Safety · Automotive quality systems</li>
            <li>Community organizer · The Fledge founder & CEO</li>
            <li>Software development since 1988 · U of M Statistics/CS</li>
            <li>GAIA Solutions · jadian consulting · ePazz</li>
            <li>Business Acceleration Fund Gatekeeper, LEAP (5 years)</li>
          </ul>
          <p className="team-bio">&ldquo;If I were at a bar talking to a businessman, I&apos;d explain it one way. If it was a mathematician, I&apos;d explain it in terms of chaos theory. Same answer. Different language. Always honest.&rdquo;</p>
        </div>
        <div className="team-card">
          <p className="team-role-tag">Co-founder · Investigation & OSINT</p>
          <h3 className="team-name">Mark Voldeck</h3>
          <ul className="team-list">
            <li>Investigative journalist</li>
            <li>OSINT methodology & civic tech</li>
            <li>Public records research</li>
            <li>Rhinoceros Media co-founder</li>
          </ul>
          <p className="team-bio">Asks what they&apos;re not telling you. Shapes the investigative discipline across all gaia.solutions work — the rigor that makes the civic tech hold up under scrutiny.</p>
        </div>
        <div className="team-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ border: "1.5px dashed var(--rule-heavy)", padding: "2rem", textAlign: "center" }}>
            <p className="team-role-tag" style={{ marginBottom: "1rem" }}>Open member slot</p>
            <h3 className="t-display-sm" style={{ marginBottom: "1rem" }}>You?</h3>
            <p className="t-body-sm" style={{ color: "#777", marginBottom: "1.5rem" }}>The next member of this collective joins at equal standing. Same stakes, same voice, same accountability. We&apos;re looking for someone who brings a complementary discipline and a commitment to worker ownership as a structural principle.</p>
            <Link href="/co-op#join" className="btn btn-ghost">Learn about joining</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
