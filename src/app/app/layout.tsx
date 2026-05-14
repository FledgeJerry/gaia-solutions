import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AppSignOut from "@/components/AppSignOut";

const NAV_LINKS = [
  { href: "/app/crm", label: "CRM" },
  { href: "/app/companies", label: "Companies" },
  { href: "/app/board", label: "Board" },
  { href: "/app/proposals", label: "Proposals" },
  { href: "/app/time", label: "Time" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = session.user?.role === "ADMIN";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header style={{ height: "52px", background: "var(--ink)", borderBottom: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", flexShrink: 0, gap: "1.5rem" }}>
        <Link href="/" style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.10em", color: "var(--gold)", textDecoration: "none", flexShrink: 0 }}>
          gaia<em style={{ fontStyle: "normal", color: "var(--red)" }}>.</em>solutions
        </Link>
        <nav style={{ display: "flex", gap: "1.25rem", alignItems: "center", flex: 1 }}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--lichen)", textDecoration: "none" }}>
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/app/members" style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--amber)", textDecoration: "none" }}>
              Members
            </Link>
          )}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexShrink: 0 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#999" }}>{session.user?.name ?? session.user?.email}</span>
          <AppSignOut />
        </div>
      </header>
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}
