"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function Nav() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo" onClick={() => setOpen(false)}>
        gaia<em>.</em>solutions
      </Link>

      {/* Desktop links */}
      <ul className="nav-links">
        <li><Link href="/work">Work</Link></li>
        <li><Link href="/capabilities">Capabilities</Link></li>
        <li><Link href="/co-op">Co-op</Link></li>
        <li><Link href="/team">Team</Link></li>
        <li><Link href="/contact">Start a project</Link></li>
        {session ? (
          <li><Link href="/app/crm">App →</Link></li>
        ) : (
          <li><Link href="/login">Sign in</Link></li>
        )}
      </ul>

      {/* Hamburger — mobile */}
      <button
        className="nav-hamburger"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <span className={`ham-bar ${open ? "ham-open" : ""}`} />
        <span className={`ham-bar ${open ? "ham-open" : ""}`} />
        <span className={`ham-bar ${open ? "ham-open" : ""}`} />
      </button>

      {/* Mobile drawer */}
      {open && (
        <ul className="nav-drawer">
          <li><Link href="/work" onClick={() => setOpen(false)}>Work</Link></li>
          <li><Link href="/capabilities" onClick={() => setOpen(false)}>Capabilities</Link></li>
          <li><Link href="/co-op" onClick={() => setOpen(false)}>Co-op</Link></li>
          <li><Link href="/team" onClick={() => setOpen(false)}>Team</Link></li>
          <li><Link href="/contact" onClick={() => setOpen(false)}>Start a project</Link></li>
          {session ? (
            <li><Link href="/app/crm" onClick={() => setOpen(false)}>App →</Link></li>
          ) : (
            <li><Link href="/login" onClick={() => setOpen(false)}>Sign in</Link></li>
          )}
        </ul>
      )}
    </nav>
  );
}
