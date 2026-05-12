import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AppSidebar from "@/components/AppSidebar";

const TYPE_COLORS: Record<string, string> = {
  CLIENT:    "var(--gold)",
  PARTNER:   "#6BA3BE",
  FUNDER:    "#7CB87C",
  PRESS:     "#B87CB8",
  COMMUNITY: "#aaa",
  ECOSYSTEM: "#BE9A6B",
};

export default async function CompaniesPage() {
  const orgs = await prisma.org.findMany({
    include: { _count: { select: { contacts: true, stories: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 52px)" }}>
      <AppSidebar />

      <div style={{ padding: "1.5rem 2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h1 className="t-display-sm">Companies</h1>
            <p className="t-label" style={{ marginTop: "0.2rem" }}>{orgs.length} total</p>
          </div>
          <Link href="/app/companies/new" className="btn btn-solid" style={{ padding: "0.5rem 1rem" }}>+ Add company</Link>
        </div>

        {orgs.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", border: "1px solid var(--rule)", background: "var(--warm-white)" }}>
            <p className="t-body" style={{ color: "#888", marginBottom: "1rem" }}>No companies yet.</p>
            <Link href="/app/companies/new" className="btn btn-solid">Add your first company</Link>
          </div>
        ) : (
          <div style={{ border: "1px solid var(--rule)", background: "var(--rule)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 70px 70px 50px", gap: "1px" }}>
              <div style={{ background: "#ECEAE4", padding: "0.5rem 0.75rem" }}><span className="t-label">Name</span></div>
              <div style={{ background: "#ECEAE4", padding: "0.5rem 0.75rem" }}><span className="t-label">Type</span></div>
              <div style={{ background: "#ECEAE4", padding: "0.5rem 0.75rem" }}><span className="t-label">Contacts</span></div>
              <div style={{ background: "#ECEAE4", padding: "0.5rem 0.75rem" }}><span className="t-label">Projects</span></div>
              <div style={{ background: "#ECEAE4", padding: "0.5rem 0.75rem" }} />
            </div>
            {orgs.map(org => (
              <div key={org.id} style={{ display: "grid", gridTemplateColumns: "1fr 110px 70px 70px 50px", gap: "1px", background: "var(--rule)" }}>
                <div style={{ background: "var(--warm-white)", padding: "0.65rem 0.75rem" }}>
                  <p style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--ink)" }}>{org.name}</p>
                  {org.website && (
                    <a href={org.website} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#aaa", textDecoration: "none" }}>
                      {org.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
                <div style={{ background: "var(--warm-white)", padding: "0.65rem 0.75rem", display: "flex", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", color: TYPE_COLORS[org.type] ?? "#aaa", letterSpacing: "0.06em" }}>
                    {org.type}
                  </span>
                </div>
                <div style={{ background: "var(--warm-white)", padding: "0.65rem 0.75rem", display: "flex", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "#666" }}>{org._count.contacts}</span>
                </div>
                <div style={{ background: "var(--warm-white)", padding: "0.65rem 0.75rem", display: "flex", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "#666" }}>{org._count.stories}</span>
                </div>
                <div style={{ background: "var(--warm-white)", padding: "0.65rem 0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Link href={`/app/companies/${org.id}`} style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", color: "#888", textDecoration: "none" }}>→</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
