import Link from "next/link";

const capabilities = [
  { num: "01", title: "Civic & Investigative Tech", body: "OSINT tooling, investigative data platforms, public records pipelines, surveillance mapping, and narrative visualization. We build for journalists, advocates, and communities who need rigorous tools that can withstand scrutiny.", chips: ["OSINT", "Data viz", "Public records", "Mapping", "Investigative"] },
  { num: "02", title: "Websites & CRM for Entrepreneurs, Nonprofits & Artists", body: "Functional websites built around how you actually work — with contact management, booking, client tracking, donor management, and email marketing built in from day one. For entrepreneurs launching, nonprofits growing, and artists owning their practice. No agency markup. No dependency trap.", chips: ["CRM", "Booking systems", "Donor management", "Email marketing", "Artist portfolios", "E-commerce"] },
  { num: "03", title: "Data Platforms & Public Diagnostics", body: "Community-scale data infrastructure. Civic prediction platforms, public health dashboards, economic diagnostics, and open data pipelines. Built to be maintained, not just launched.", chips: ["PostgreSQL", "Data pipelines", "Dashboards", "Civic platforms", "Open data"] },
  { num: "04", title: "Cooperative & Community Infrastructure", body: "Technology for the solidarity economy. Co-op formation tools, federated network infrastructure, mutual aid platforms, and community-governed digital spaces. We build with, not for.", chips: ["Co-op tech", "Federated", "Mutual aid", "Community gov", "Open source"] },
];

export default function CapabilitiesPage() {
  return (
    <>
      <section className="page-pad section-pad">
        <div className="section-header">
          <span className="section-num">Capabilities</span>
          <h1 className="section-title">What we do</h1>
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
      <section style={{ background: "var(--field)", padding: "3rem 2.5rem", textAlign: "center" }}>
        <p className="t-deck" style={{ color: "#666", marginBottom: "1.5rem" }}>Sliding scale for mutual aid and co-ops. Full rate for institutions that can afford it.</p>
        <Link href="/contact" className="btn btn-signal">Start a conversation</Link>
      </section>
    </>
  );
}
