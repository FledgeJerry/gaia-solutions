import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AppSignOut from "@/components/AppSignOut";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header style={{ height: "52px", background: "var(--ink)", borderBottom: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", flexShrink: 0 }}>
        <Link href="/" style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.10em", color: "var(--gold)", textDecoration: "none" }}>
          gaia<em style={{ fontStyle: "normal", color: "var(--red)" }}>.</em>solutions
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#666" }}>{session.user?.name ?? session.user?.email}</span>
          <AppSignOut />
        </div>
      </header>
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}
