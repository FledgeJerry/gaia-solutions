"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const text = await res.text();
      let msg = "Something went wrong.";
      try { msg = JSON.parse(text).error || msg; } catch { msg = text || msg; }
      setError(msg);
      setLoading(false);
      return;
    }

    setDone(true);
  }

  const inputStyle = {
    width: "100%", padding: "0.65rem 0.75rem", border: "1px solid var(--rule)",
    background: "var(--warm-white)", fontFamily: "var(--font-sans)", fontSize: "0.88rem", outline: "none",
  };
  const labelStyle = {
    fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.10em",
    textTransform: "uppercase" as const, color: "#999", display: "block", marginBottom: "0.4rem",
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#999", marginBottom: "0.5rem" }}>gaia.solutions</p>
        <h1 className="t-display-md" style={{ marginBottom: "0.5rem" }}>Reset password</h1>

        {done ? (
          <>
            <p className="t-body" style={{ color: "#888", marginBottom: "1.5rem" }}>
              If that email has an account, a reset link is on its way. Check your inbox — and your spam folder.
            </p>
            <Link href="/login" className="btn btn-solid" style={{ display: "inline-block" }}>Back to sign in</Link>
          </>
        ) : (
          <>
            <p className="t-body" style={{ color: "#888", marginBottom: "2rem" }}>
              Enter your email and we&apos;ll send a reset link.
            </p>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              {error && <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--red)" }}>{error}</p>}
              <button type="submit" disabled={loading} className="btn btn-solid" style={{ marginTop: "0.5rem" }}>
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--sage)", marginTop: "1.5rem", textAlign: "center" }}>
              <Link href="/login" style={{ color: "var(--moss)", textDecoration: "underline" }}>Back to sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
