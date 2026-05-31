"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/app/crm", label: "Contacts" },
  { href: "/app/companies", label: "Companies" },
  { href: "/app/board", label: "Board" },
  { href: "/app/requests", label: "Requests" },
  { href: "/app/proposals", label: "Proposals" },
  { href: "/app/time", label: "Time" },
];

export default function AppSidebar() {
  const path = usePathname();

  return (
    <aside style={{ background: "var(--field)", borderRight: "1px solid var(--field-border)", padding: "1.5rem 1rem" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#444", marginBottom: "1rem" }}>Tools</p>
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {NAV.map(({ href, label }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                letterSpacing: "0.06em",
                color: active ? "var(--paper)" : "#555",
                padding: "0.4rem 0.6rem",
                background: active ? "var(--field-mid)" : "transparent",
                textDecoration: "none",
                borderRadius: "2px",
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
