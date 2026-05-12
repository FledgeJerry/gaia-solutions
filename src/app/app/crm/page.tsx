import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AppSidebar from "@/components/AppSidebar";

function daysSince(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}

function calcWarmth(lastTouched: Date) {
  const days = daysSince(lastTouched);
  if (days <= 3) return 85;
  if (days <= 14) return 55;
  if (days <= 30) return 25;
  return 5;
}

function warmthLabel(score: number) {
  if (score >= 70) return { label: "Hot", color: "var(--red)" };
  if (score >= 40) return { label: "Warm", color: "var(--gold)" };
  if (score >= 15) return { label: "Cool", color: "#aaa" };
  return { label: "Cold", color: "#ddd" };
}

export default async function CRMPage() {
  const contacts = await prisma.contact.findMany({
    include: { org: true },
    orderBy: { lastTouchedAt: "desc" },
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 52px)" }}>
      <AppSidebar />

      <div style={{ padding: "1.5rem 2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h1 className="t-display-sm">Contacts</h1>
            <p className="t-label" style={{ marginTop: "0.2rem" }}>{contacts.length} total</p>
          </div>
          <Link href="/app/crm/new" className="btn btn-solid" style={{ padding: "0.5rem 1rem" }}>+ Add contact</Link>
        </div>

        {contacts.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", border: "1px solid var(--rule)", background: "var(--warm-white)" }}>
            <p className="t-body" style={{ color: "#888", marginBottom: "1rem" }}>No contacts yet.</p>
            <Link href="/app/crm/new" className="btn btn-solid">Add your first contact</Link>
          </div>
        ) : (
          <div style={{ border: "1px solid var(--rule)", background: "var(--rule)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 100px 70px", gap: "1px" }}>
              <div style={{ background: "#ECEAE4", padding: "0.5rem 0.75rem" }}><span className="t-label">Name / Org</span></div>
              <div style={{ background: "#ECEAE4", padding: "0.5rem 0.75rem" }}><span className="t-label">Last touch</span></div>
              <div style={{ background: "#ECEAE4", padding: "0.5rem 0.75rem" }}><span className="t-label">Warmth</span></div>
              <div style={{ background: "#ECEAE4", padding: "0.5rem 0.75rem" }} />
            </div>
            {contacts.map(contact => {
              const warmth = calcWarmth(contact.lastTouchedAt);
              const { label, color } = warmthLabel(warmth);
              const days = daysSince(contact.lastTouchedAt);
              return (
                <div key={contact.id} style={{ display: "grid", gridTemplateColumns: "1fr 140px 100px 70px", gap: "1px", background: "var(--rule)" }}>
                  <div style={{ background: "var(--warm-white)", padding: "0.65rem 0.75rem" }}>
                    <p style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--ink)" }}>{contact.name}</p>
                    {contact.org && <p style={{ fontSize: "0.72rem", color: "#888" }}>{contact.org.name}</p>}
                    {contact.role && <p style={{ fontSize: "0.70rem", color: "#aaa" }}>{contact.role}</p>}
                  </div>
                  <div style={{ background: "var(--warm-white)", padding: "0.65rem 0.75rem", display: "flex", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "#999" }}>
                      {days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days}d ago`}
                    </span>
                  </div>
                  <div style={{ background: "var(--warm-white)", padding: "0.65rem 0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "40px", height: "4px", background: "var(--rule)", borderRadius: "2px" }}>
                      <div style={{ width: `${warmth}%`, height: "4px", background: color, borderRadius: "2px" }} />
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color }}>{label}</span>
                  </div>
                  <div style={{ background: "var(--warm-white)", padding: "0.65rem 0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Link href={`/app/crm/${contact.id}`} style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", color: "#888", textDecoration: "none" }}>→</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
