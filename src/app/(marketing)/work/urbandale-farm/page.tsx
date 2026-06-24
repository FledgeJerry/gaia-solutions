import Link from "next/link";

const stack = [
  { num: "01", title: "Edge Compute", body: "Raspberry Pi 4 — orchestration, CRM/ERP logic, local web server. All data on-device." },
  { num: "02", title: "AI Inference", body: "Google Coral Edge TPU — on-device ML. Fast, private, offline. No cloud inference." },
  { num: "03", title: "Vision", body: "ESP32-CAM + OV2640 — camera input for inventory and activity monitoring." },
  { num: "04", title: "Power", body: "Solar + battery. Designed for off-grid operation at a working farm." },
  { num: "05", title: "CRM + ERP", body: "Python + SQLite. Contact tracking, volunteer management, crop inventory, sensor logs." },
  { num: "06", title: "Network", body: "Local WiFi — fledgefarm.local. Public summary endpoint for Fledge ecosystem integration." },
];

export default function UrbandaleFarmPage() {
  return (
    <>
      {/* HERO */}
      <section style={{ background: "var(--field)", padding: "5rem 2.5rem 4rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <span className="pill pill-amber" style={{ marginBottom: "1.5rem", display: "inline-block" }}>Community Infrastructure</span>
          <h1 className="t-display-xl" style={{ color: "var(--paper)", marginBottom: "1.5rem" }}>Urbandale Farm OS</h1>
          <p className="t-deck" style={{ maxWidth: "560px" }}>
            A small, sovereign data center for a community farm. Built to run offline, powered by solar, and designed to make people smarter — not replace them.
          </p>
        </div>
      </section>

      {/* 01 — WHAT WE BUILT */}
      <section className="page-pad section-pad">
        <div className="section-header">
          <span className="section-num">01</span>
          <h2 className="section-title">What we built</h2>
        </div>
        <p className="t-body-lg" style={{ maxWidth: "680px", marginBottom: "1rem" }}>
          Urbandale Farm needed an operating system — not a cloud app, not a subscription service, not something that stops working when the internet goes down. We built one that lives entirely on-site.
        </p>
        <p className="t-body-lg" style={{ maxWidth: "680px", marginBottom: "2rem" }}>
          The system runs on a Raspberry Pi 4 with a Google Coral Edge TPU for local AI inference and an ESP32-CAM for vision. It is solar-powered. It serves a full CRM, ERP, and sensor dashboard over local WiFi to anyone on the farm network. No data leaves the property. No cloud dependency for any core function.
        </p>
      </section>

      <div className="stat-strip">
        <div className="stat-cell"><span className="stat-number">Pi 4</span><span className="stat-label">Raspberry Pi 4</span></div>
        <div className="stat-cell"><span className="stat-number">TPU</span><span className="stat-label">Google Coral TPU</span></div>
        <div className="stat-cell"><span className="stat-number">CAM</span><span className="stat-label">ESP32-CAM</span></div>
        <div className="stat-cell"><span className="stat-number">☀</span><span className="stat-label">Solar-Powered</span></div>
        <div className="stat-cell"><span className="stat-number">0</span><span className="stat-label">Internet Required</span></div>
      </div>

      {/* 02 — THE DESIGN DECISION THAT MATTERS */}
      <div className="manifesto-band">
        <p className="manifesto-headline">The people power it.<br />The AI assists.</p>
        <p className="manifesto-sub">Most systems optimize for AI doing more and humans doing less. We optimized for depth of experience, quality of learning, and genuine relationship between people and the tools they use.</p>
      </div>
      <section className="page-pad section-pad">
        <p className="t-body-lg" style={{ maxWidth: "680px", marginBottom: "1rem" }}>
          The AI does not deliver verdicts. It notices things and asks what you think. It stays quiet unless it has something useful to surface. It never acts without a human deciding. When it is wrong — and it will be wrong — that is a learning moment worth keeping, not an error to suppress.
        </p>
        <p className="t-deck" style={{ maxWidth: "680px" }}>
          Farm workers are not watched by this system. They are accompanied by it.
        </p>
      </section>

      {/* 03 — TEACHING THE AI */}
      <section className="page-pad section-pad" style={{ background: "var(--fog)" }}>
        <div className="section-header" style={{ borderBottomColor: "var(--rule-heavy)" }}>
          <span className="section-num">03</span>
          <h2 className="section-title">Teaching the AI</h2>
          <p className="section-dek">The community teaches the system what the system cannot know.</p>
        </div>
        <p className="t-body-lg" style={{ maxWidth: "680px", marginBottom: "1rem" }}>
          A model trained on farms in general does not know what healthy basil looks like in August in Michigan. It does not know what this soil does after a wet spring. It does not know the vocabulary the people here use to describe what they see.
        </p>
        <p className="t-body-lg" style={{ maxWidth: "680px", marginBottom: "2rem" }}>
          So we built the system to learn from the people who work it. Farm workers label what the camera observes. Visitors contribute their own observations alongside sensor data. Over time the system becomes specific — to this land, this community, this season. The learning journal logs failures and surprises alongside successes. The AI&apos;s uncertainty is visible.
        </p>
        <p className="t-deck" style={{ maxWidth: "680px" }}>
          Not &ldquo;here is what our AI sees.&rdquo; But: here is what our AI is still learning, and here is how we are teaching it.
        </p>
      </section>

      {/* 04 — BUILT IN PUBLIC */}
      <section className="page-pad section-pad">
        <div className="section-header">
          <span className="section-num">04</span>
          <h2 className="section-title">Built in public</h2>
        </div>
        <p className="t-body-lg" style={{ maxWidth: "680px", marginBottom: "1rem" }}>
          There is no live URL yet. The artifact right now is the process — the architectural decisions, the philosophical framing, the open questions, the documentation. All of it is public.
        </p>
        <p className="t-body-lg" style={{ maxWidth: "680px", marginBottom: "1.5rem" }}>
          We build this way because the most interesting thing about Urbandale Farm is not what it does when it is finished. It is what it reveals about how technology can be designed: with community ownership, data sovereignty, and genuine respect for the people it serves — including the AI layer itself.
        </p>
        <span className="pill pill-gray">Following the build — public log coming soon</span>
      </section>

      {/* 05 — THE STACK */}
      <section className="page-pad section-pad" style={{ background: "var(--fog)" }}>
        <div className="section-header" style={{ borderBottomColor: "var(--rule-heavy)" }}>
          <span className="section-num">05</span>
          <h2 className="section-title">The stack</h2>
        </div>
        <div className="approach-grid">
          {stack.map(s => (
            <div key={s.num} className="approach-cell">
              <p className="approach-num">{s.num}</p>
              <h3 className="approach-title">{s.title}</h3>
              <p className="approach-body">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--field)", padding: "3rem 2.5rem", textAlign: "center" }}>
        <p className="t-deck" style={{ marginBottom: "1.5rem" }}>Sliding scale for mutual aid and co-ops. Full rate for institutions that can afford it.</p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/work" className="btn btn-ghost-light">See more work</Link>
          <Link href="/contact" className="btn btn-signal">Start a conversation</Link>
        </div>
      </section>
    </>
  );
}
