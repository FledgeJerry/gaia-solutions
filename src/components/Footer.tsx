import Link from "next/link";

export default function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer-col">
          <p className="footer-brand-name">gaia<em>.</em>solutions</p>
          <p className="footer-tagline">Worker-owned software cooperative. Tools that hold up — or tear down. Your call.</p>
          <span className="footer-mark">Worker-owned · Open source · No bullshit</span>
        </div>
        <div className="footer-col">
          <h5>Work</h5>
          <ul>
            <li><Link href="/work">Portfolio</Link></li>
            <li><Link href="/capabilities">Capabilities</Link></li>
            <li><Link href="/contact">Start a project</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Co-op</h5>
          <ul>
            <li><Link href="/co-op">What we are</Link></li>
            <li><Link href="/co-op#join">Join the collective</Link></li>
            <li><Link href="/team">The team</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Ecosystem</h5>
          <ul>
            <li><a href="https://thefledge.com" target="_blank" rel="noopener noreferrer">The Fledge</a></li>
            <li><a href="https://resilience.foundation" target="_blank" rel="noopener noreferrer">resilience.foundation</a></li>
            <li><a href="https://lansing.love" target="_blank" rel="noopener noreferrer">lansing.love</a></li>
            <li><a href="https://wikicafe.org" target="_blank" rel="noopener noreferrer">Wiki Cafe</a></li>
            <li><a href="https://social.coop/@wikicafe" target="_blank" rel="noopener noreferrer">@wikicafe@social.coop</a></li>
          </ul>
        </div>
      </footer>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} gaia.solutions — Worker-owned software cooperative, Lansing MI</p>
        <span className="footer-mark">Primus inter pares</span>
      </div>
    </>
  );
}
