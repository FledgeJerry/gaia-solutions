import Link from "next/link";

const work = [
  { href: "https://lrc-pac.vercel.app/", category: "Civic / OSINT", title: "LRC-PAC Zoning Investigation", body: "Deep mapping of developer relationships and zoning decisions across Lansing's political landscape. Follow the money, not the narrative.", featured: true },
  { href: "https://zoning-one.vercel.app/", category: "Investigation", title: "Deep Green Relationship Map", body: "OSINT-built network graph tracing relationships between environmental orgs, funders, and policy actors." },
  { href: "https://redlining-six.vercel.app/", category: "Equity / Maps", title: "Redlined: Lansing MI", body: "Historical redlining boundaries overlaid with current housing data. The past is still the present." },
  { href: "https://alpr-eight.vercel.app/", category: "Civil Liberties", title: "ALPR Surveillance Map", body: "Tracking license plate reader deployment across mid-Michigan. Where surveillance infrastructure lives." },
  { href: "https://data-center-rho.vercel.app/", category: "Env Justice", title: "Great Lakes Data Center Impact", body: "Water and energy footprint of data centers proposed for the Great Lakes region." },
  { href: "https://lansing-housing.vercel.app/", category: "Affordability", title: "Lansing Housing Tracker", body: "Permit data, affordability trends, and displacement risk by neighborhood." },
  { href: "https://local-effect-snap.vercel.app/", category: "Policy", title: "SNAP Narrative Map", body: "Local economic multiplier effects of SNAP benefits, mapped by census tract." },
  { href: "https://lansing.love", category: "Civic Platform", title: "lansing.love", body: "Community civic prediction and engagement platform for Lansing, MI." },
  { href: "https://rhinocerosmedia.org", category: "Web / Co-op", title: "Rhinoceros Media", body: "Website for Rhinoceros Media — independent community journalism co-op." },
  { href: "https://thefledge.com", category: "Web / Nonprofit", title: "The Fledge", body: "Full Next.js rebuild of a WordPress site for Lansing's makerspace and community hub. Events, booking, Stripe ticketing, AskFledge AI assistant, bounty board, and co-op incubation tools.", featured: true },
  { href: "https://resilience.foundation", category: "Web App / Co-op", title: "Crash Out: A Resiliency Hub", body: "Co-op formation platform and entrepreneurial journey tool for ALICE households. 13-part co-op handbook, AI document generation, housing roadmap, and peer support ecosystem.", featured: true },
];

const capabilities = [
  { num: "01", title: "Civic & Investigative Tech", body: "OSINT tooling, investigative data platforms, public records pipelines, surveillance mapping, and narrative visualization. We build for journalists, advocates, and communities who need rigorous tools that can withstand scrutiny.", chips: ["OSINT", "Data viz", "Public records", "Mapping", "Investigative"] },
  { num: "02", title: "Websites & CRM for Entrepreneurs, Nonprofits & Artists", body: "Functional websites built around how you actually work — with contact management, booking, client tracking, donor management, and email marketing built in from day one. For entrepreneurs launching, nonprofits growing, and artists owning their practice. No agency markup. No dependency trap.", chips: ["CRM", "Booking systems", "Donor management", "Email marketing", "Artist portfolios", "E-commerce"] },
  { num: "03", title: "Data Platforms & Public Diagnostics", body: "Community-scale data infrastructure. Civic prediction platforms, public health dashboards, economic diagnostics, and open data pipelines. Built to be maintained, not just launched.", chips: ["PostgreSQL", "Data pipelines", "Dashboards", "Civic platforms", "Open data"] },
  { num: "04", title: "Cooperative & Community Infrastructure", body: "Technology for the solidarity economy. Co-op formation tools, federated network infrastructure, mutual aid platforms, and community-governed digital spaces. We build with, not for.", chips: ["Co-op tech", "Federated", "Mutual aid", "Community gov", "Open source"] },
];

const principles = [
  { num: "01", title: "Binding over voluntary", body: "We make commitments that hold. Agreements are binding, not suggestions. Accountability is structural, not interpersonal." },
  { num: "02", title: "Auditor's rigor", body: "Every system gets the same scrutiny you'd apply to a formal audit. Evidence-based. Traceable. No assumptions left unchecked." },
  { num: "03", title: "Open source default", body: "If it can be open, it is. We build in the open, share what we learn, and refuse to lock communities into tools they don't control." },
  { num: "04", title: "No extractive pricing", body: "Sliding scale for mutual aid and co-ops. Full rate for institutions that can afford it. We don't extract from the communities we work with." },
  { num: "05", title: "Build with, not for", body: "We don't hand off black boxes. We build internal capacity alongside the software itself. When we leave, you can maintain what we built." },
  { num: "06", title: "First among equals", body: "Primus inter pares. Every co-op member — founders included — holds equal stakes, equal voice, equal accountability." },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section style={{ background: "var(--field)", padding: "5rem 2.5rem 4rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", maxWidth: "1200px", margin: "0 auto", alignItems: "start" }}>
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "2rem" }}>
              {["worker-owned", "Lansing MI", "entrepreneurs", "nonprofits", "artists", "activists", "investigators", "community builders"].map(tag => (
                <span key={tag} className="pill pill-gray">{tag}</span>
              ))}
            </div>
            <h1 className="t-display-xl" style={{ color: "var(--paper)", marginBottom: "1.5rem" }}>
              We build tools<br />that hold up.<br />
              <em style={{ fontStyle: "italic", color: "#888" }}>Or tear down.<br />Your call.</em>
            </h1>
            <p className="t-deck" style={{ color: "#666", marginBottom: "2rem", maxWidth: "440px" }}>
              A worker-owned software cooperative building rigorous technology for entrepreneurs, co-ops, nonprofits, governments, and institutions — from local to global scale.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link href="/work" className="btn btn-ghost-light">See the work</Link>
              <Link href="/co-op" className="btn btn-signal">Join the co-op</Link>
            </div>
          </div>
          <div>
            <div style={{ borderLeft: "1px solid var(--field-border)", paddingLeft: "2rem" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                {[
                  { label: "Structure", value: "Worker-owned LLC" },
                  { label: "CRM", value: "Entrepreneurs · Nonprofits · Artists" },
                  { label: "Investigation", value: "OSINT · Civic tech · Public records" },
                  { label: "Tech", value: "Full-stack · Open source · Self-hosted" },
                  { label: "also", value: null },
                  { label: "Clients", value: "Co-ops · Nonprofits · Governments · Institutions" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", gap: "1rem", padding: "0.5rem 0", borderBottom: "1px solid var(--field-rule)", alignItems: "baseline" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", letterSpacing: "0.10em", textTransform: "uppercase", color: label === "also" ? "var(--gold)" : "#555", flexShrink: 0, width: "90px" }}>{label}</span>
                    {value && <span style={{ fontSize: "0.82rem", fontWeight: 300, color: "#888" }}>{value}</span>}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <span className="pulse-dot" />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "#555" }}>Recent work</span>
                </div>
                {work.slice(0, 4).map(w => (
                  <a key={w.href} href={w.href} target="_blank" rel="noopener noreferrer" style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid var(--field-rule)", textDecoration: "none" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 300, color: "#888" }}>{w.title}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0, marginLeft: "1rem" }}>{w.category}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO BAND */}
      <div className="manifesto-band">
        <p className="manifesto-headline">Ready to crash out.<br />Ready to help you do better.</p>
        <p className="manifesto-sub">We don&apos;t pick a lane. Ready to dismantle systems that don&apos;t serve people — and equally ready to help the ones that do work better. The tools are the same. The question is what you&apos;re building toward.</p>
      </div>

      {/* STAT STRIP */}
      <div className="stat-strip">
        <div className="stat-cell"><span className="stat-number">10+</span><span className="stat-label">Years community building</span></div>
        <div className="stat-cell"><span className="stat-number">CRM</span><span className="stat-label">Built in from day one</span></div>
        <div className="stat-cell"><span className="stat-number">OS</span><span className="stat-label">Open source default</span></div>
        <div className="stat-cell"><span className="stat-number">0</span><span className="stat-label">Bullshit tolerance</span></div>
        <div className="stat-cell"><span className="stat-number">=</span><span className="stat-label">Equal stakes</span></div>
      </div>

      {/* WHO WE ARE */}
      <section className="page-pad section-pad">
        <div className="section-header">
          <span className="section-num">02</span>
          <h2 className="section-title">Who we work with</h2>
          <p className="section-dek">Anyone building something that holds up — or tearing down something that doesn&apos;t.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--rule)", border: "1px solid var(--rule)" }}>
          {[
            { title: "Entrepreneurs & builders", body: "From first idea to co-op formation. We walk the whole path with you.", dark: false },
            { title: "Artists & community", body: "Infrastructure that centers your practice, not platforms that extract from it.", dark: false },
            { title: "Nonprofits & organizers", body: "Donor management, volunteer coordination, and community tools without the enterprise price tag.", dark: true },
            { title: "Activists & advocates", body: "Tech that doesn’t compromise your values or your security.", dark: true },
            { title: "Systems thinkers", body: "If you see the whole board, we speak your language.", dark: false },
            { title: "Local to global", body: "From Lansing city council to multi-national standards bodies. Same rigor, different scale.", dark: false },
          ].map(({ title, body, dark }) => (
            <div key={title} style={{ background: dark ? "var(--field-mid)" : "var(--warm-white)", padding: "2rem 1.75rem" }}>
              <h3 className="t-display-sm" style={{ color: dark ? "var(--paper)" : "var(--ink)", marginBottom: "0.6rem" }}>{title}</h3>
              <p className="t-body-sm" style={{ color: dark ? "#888" : "#666" }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SELECTED WORK */}
      <section className="page-pad section-pad" style={{ background: "var(--fog)" }}>
        <div className="section-header" style={{ borderBottomColor: "var(--rule-heavy)" }}>
          <span className="section-num">03</span>
          <h2 className="section-title">Selected work</h2>
          <p className="section-dek">Civic tech, investigative data, community infrastructure.</p>
        </div>
        <div className="work-grid">
          {work.map(w => (
            <a key={w.href} href={w.href} target="_blank" rel="noopener noreferrer" className={`work-card${w.featured ? " work-card-featured" : ""}`} style={{ display: "flex", flexDirection: "column", textDecoration: "none" }}>
              <p className="work-card-category">{w.category}</p>
              <h3 className="work-card-title">{w.title}</h3>
              <p className="work-card-body">{w.body}</p>
              <span className="work-card-url">{w.href.replace("https://", "")} →</span>
            </a>
          ))}
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="page-pad section-pad">
        <div className="section-header">
          <span className="section-num">04</span>
          <h2 className="section-title">Capabilities</h2>
          <p className="section-dek">Four areas. One standard of rigor.</p>
        </div>
        <div className="cap-grid">
          {capabilities.map(c => (
            <div key={c.num} className="cap-card">
              <p className="cap-number">{c.num}</p>
              <h3 className="cap-title">{c.title}</h3>
              <p className="cap-body">{c.body}</p>
              <div>{c.chips.map(chip => <span key={chip} className="chip">{chip}</span>)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* THE COLLECTIVE */}
      <section className="page-pad section-pad" style={{ background: "var(--fog)" }}>
        <div className="section-header" style={{ borderBottomColor: "var(--rule-heavy)" }}>
          <span className="section-num">05</span>
          <h2 className="section-title">The collective</h2>
          <p className="section-dek">Primus inter pares — first among equals.</p>
        </div>
        <div className="team-grid">
          <div className="team-card">
            <p className="team-role-tag">Co-founder · Systems & community</p>
            <h3 className="team-name">Jerry Norris</h3>
            <ul className="team-list">
              <li>Community organizer · The Fledge founder & CEO</li>
              <li>Software dev since 1988 · U of M Statistics/CS</li>
              <li>GAIA Solutions · jadian · ePazz</li>
            </ul>
            <p className="team-bio">&ldquo;If I were at a bar talking to a businessman, I&apos;d explain it one way. If it was a mathematician, I&apos;d explain it in terms of chaos theory.&rdquo;</p>
          </div>
          <div className="team-card">
            <p className="team-role-tag">Co-founder · Investigation & OSINT</p>
            <h3 className="team-name">Mark Voldeck</h3>
            <ul className="team-list">
              <li>Investigative journalist</li>
              <li>OSINT methodology</li>
              <li>Civic tech · Public records</li>
              <li>Rhinoceros Media co-founder</li>
            </ul>
            <p className="team-bio">Asks what they&apos;re not telling you. Shapes the investigative discipline across all gaia.solutions work.</p>
          </div>
          <div className="team-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ border: "1.5px dashed var(--rule-heavy)", padding: "2rem", textAlign: "center" }}>
              <p className="team-role-tag" style={{ marginBottom: "1rem" }}>Open member slot</p>
              <h3 className="t-display-sm" style={{ marginBottom: "1rem" }}>You?</h3>
              <p className="t-body-sm" style={{ color: "#777", marginBottom: "1.5rem" }}>The next member of this collective joins at equal standing. Same stakes, same voice, same accountability.</p>
              <Link href="/co-op#join" className="btn btn-ghost">Learn about joining</Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW WE WORK */}
      <section className="page-pad section-pad">
        <div className="section-header">
          <span className="section-num">06</span>
          <h2 className="section-title">How we work</h2>
          <p className="section-dek">Six principles. Non-negotiable.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--rule)", border: "1px solid var(--rule)" }}>
          {principles.map(p => (
            <div key={p.num} style={{ background: "var(--warm-white)", padding: "1.75rem" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.10em", color: "var(--red)", marginBottom: "0.5rem" }}>{p.num}</p>
              <h3 className="t-display-sm" style={{ marginBottom: "0.6rem" }}>{p.title}</h3>
              <p className="t-body-sm" style={{ color: "#666" }}>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section style={{ background: "var(--field)", padding: "4rem 2.5rem", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#555", marginBottom: "1rem" }}>Ready when you are</p>
        <h2 className="t-display-lg" style={{ color: "var(--paper)", marginBottom: "1rem" }}>Build something<br />that holds up.</h2>
        <p className="t-deck" style={{ color: "#666", marginBottom: "2rem" }}>Or tear down something that doesn&apos;t. Either way, let&apos;s talk.</p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/contact" className="btn btn-signal">Start a conversation</Link>
          <Link href="/co-op" className="btn btn-ghost-light">Join the co-op</Link>
        </div>
      </section>
    </>
  );
}
