"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [timeline, setTimeline] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, timeline }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  const inp: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid var(--rule)",
    background: "var(--warm-white)",
    fontFamily: "var(--font-sans)",
    fontSize: "0.9rem",
    color: "var(--ink)",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <>
      <section className="page-pad section-pad">
        <div className="section-header">
          <span className="section-num">Contact</span>
          <h1 className="section-title">Start a project</h1>
          <p className="section-dek">We respond to every serious inquiry.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", maxWidth: "900px" }}>
          <div>
            <p className="t-body" style={{ color: "#555", marginBottom: "1.5rem" }}>Tell us what you&apos;re building — or tearing down. We&apos;ll tell you honestly whether we&apos;re the right fit.</p>
            <p className="t-body" style={{ color: "#555", marginBottom: "2rem" }}>Sliding scale for mutual aid and co-ops. Full rate for institutions that can afford it.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <a href="mailto:jerry@thefledge.com" style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--ink)", textDecoration: "none" }}>jerry@thefledge.com</a>
              <a href="https://thefledge.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "#888", textDecoration: "none" }}>thefledge.com — 1300 Eureka Street, Lansing MI</a>
            </div>
          </div>

          <div style={{ background: "var(--warm-white)", border: "1px solid var(--rule)", padding: "2rem" }}>
            {status === "sent" ? (
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#4a7c59", marginBottom: "1rem" }}>Message received</p>
                <p className="t-body-sm" style={{ color: "#555" }}>Thanks — we&apos;ll be in touch within a day or two.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", marginBottom: "0.5rem" }}>Name</label>
                  <input style={inp} type="text" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", marginBottom: "0.5rem" }}>Email</label>
                  <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", marginBottom: "0.5rem" }}>Timeline</label>
                  <select style={{ ...inp, cursor: "pointer" }} value={timeline} onChange={e => setTimeline(e.target.value)}>
                    <option value="">— select —</option>
                    <option value="ASAP">ASAP</option>
                    <option value="1–3 months">1–3 months</option>
                    <option value="3–6 months">3–6 months</option>
                    <option value="6+ months">6+ months</option>
                    <option value="Just exploring">Just exploring</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", marginBottom: "0.5rem" }}>What are you building?</label>
                  <textarea style={{ ...inp, minHeight: 120, resize: "vertical" }} value={message} onChange={e => setMessage(e.target.value)} required />
                </div>
                {status === "error" && (
                  <p style={{ fontSize: "0.82rem", color: "#c0392b" }}>Something went wrong — email us directly at jerry@thefledge.com.</p>
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  style={{ background: "var(--ink)", color: "var(--paper)", fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 24px", border: "none", cursor: status === "sending" ? "not-allowed" : "pointer", opacity: status === "sending" ? 0.6 : 1, alignSelf: "flex-start" }}
                >
                  {status === "sending" ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
