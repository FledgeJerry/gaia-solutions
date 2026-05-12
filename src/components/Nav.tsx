import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Nav() {
  const session = await auth();

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        gaia<em>.</em>solutions
      </Link>
      <ul className="nav-links">
        <li><Link href="/work">Work</Link></li>
        <li><Link href="/capabilities">Capabilities</Link></li>
        <li><Link href="/co-op">Co-op</Link></li>
        <li><Link href="/team">Team</Link></li>
        <li><Link href="/contact" className="nav-cta">Start a project</Link></li>
        {session ? (
          <li><Link href="/app/crm" className="nav-cta">App →</Link></li>
        ) : (
          <li><Link href="/login">Sign in</Link></li>
        )}
      </ul>
    </nav>
  );
}
