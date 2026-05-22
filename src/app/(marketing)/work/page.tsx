import Link from "next/link";

const work = [
  { href: "https://lrc-pac.vercel.app/", category: "Civic / OSINT", title: "LRC-PAC Zoning Investigation", body: "Deep mapping of developer relationships and zoning decisions across Lansing's political landscape. Follow the money, not the narrative.", featured: true },
  { href: "https://zoning-one.vercel.app/", category: "Investigation", title: "Deep Green Relationship Map", body: "OSINT-built network graph tracing relationships between environmental orgs, funders, and policy actors." },
  { href: "https://redlining-six.vercel.app/", category: "Equity / Maps", title: "Redlined: Lansing MI", body: "Historical redlining boundaries overlaid with current housing data. The past is still the present." },
  { href: "https://alpr-eight.vercel.app/", category: "Civil Liberties", title: "ALPR Surveillance Map", body: "Tracking license plate reader deployment across mid-Michigan." },
  { href: "https://data-center-rho.vercel.app/", category: "Env Justice", title: "Great Lakes Data Center Impact", body: "Water and energy footprint of data centers proposed for the Great Lakes region." },
  { href: "https://lansing-housing.vercel.app/", category: "Affordability", title: "Lansing Housing Tracker", body: "Permit data, affordability trends, and displacement risk by neighborhood." },
  { href: "https://local-effect-snap.vercel.app/", category: "Policy", title: "SNAP Narrative Map", body: "Local economic multiplier effects of SNAP benefits, mapped by census tract." },
  { href: "https://lansing.love", category: "Civic Platform", title: "lansing.love", body: "Community civic prediction and engagement platform for Lansing, MI." },
  { href: "https://rhinocerosmedia.org", category: "Web / Co-op", title: "Rhinoceros Media", body: "Website for Rhinoceros Media — independent community journalism co-op." },
  { href: "https://thefledge.com", category: "Web / Nonprofit", title: "The Fledge", body: "Full Next.js rebuild of a WordPress site for Lansing's makerspace and community hub. Events, booking, Stripe ticketing, AskFledge AI assistant, bounty board, and co-op incubation tools.", featured: true },
  { href: "https://resilience.foundation", category: "Web App / Co-op", title: "Crash Out: A Resiliency Hub", body: "Co-op formation platform and entrepreneurial journey tool for ALICE households. 13-part co-op handbook, AI document generation, housing roadmap, and peer support ecosystem.", featured: true },
  { href: "https://regionpulse.com", category: "Web / Media", title: "RegionPulse", body: "Regional media and civic information platform." },
  { href: "https://clm-mvp.vercel.app/", category: "Web App", title: "CLM MVP", body: "Contract lifecycle management MVP." },
  { href: "https://launch-intel.vercel.app/", category: "Web App", title: "Idea Generator", body: "Structured ideation tool for entrepreneurs." },
];

export default function WorkPage() {
  return (
    <section className="page-pad section-pad">
      <div className="section-header">
        <span className="section-num">Work</span>
        <h1 className="section-title">Portfolio</h1>
        <p className="section-dek">Civic tech, investigative data, co-op infrastructure, and more.</p>
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
  );
}
