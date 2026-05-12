"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (!res.ok) {
      const text = await res.text();
      let msg = "Reset failed.";
      try { msg = JSON.parse(text).error || msg; } catch { msg = text || msg; }
      setError(msg);
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 2500);
  }

  const inputStyle = {
    width: "100%", padding: "0.65rem 0.75rem", border: "1px solid var(--rule)",
    background: "var(--warm-white)", fontFamily: "var(--font-sans)", fontSize: "0.88rem", outline: "none",
  };
  const labelStyle = {
    fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.10em",
    textTransform: "uppercase" as const, color: "#999", display: "block", marginBottom: "0.4rem",
  };
  const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
  const EyeOffIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  if (!token) {
    return (
      <>
        <p className="t-body" style={{ color: "var(--red)", marginBottom: "1.5rem" }}>Invalid reset link. Please request a new one.</p>
        <Link href="/forgot-password" className="btn btn-solid" style={{ display: "inline-block" }}>Request new link</Link>
      </>
    );
  }

  if (done) {
    return (
      <p className="t-body" style={{ color: "var(--moss)" }}>
        Password updated. Redirecting to sign in…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label style={labelStyle}>New password <span style={{ color: "var(--rule-heavy)" }}>(min 8 characters)</span></label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            style={{ ...inputStyle, paddingRight: "2.5rem" }}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            style={{ position: "absolute", right: "0.6rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: "0.2rem", lineHeight: 1 }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>
      <div>
        <label style={labelStyle}>Confirm password</label>
        <input
          type={showPassword ? "text" : "password"}
          style={inputStyle}
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />
      </div>
      {error && <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--red)" }}>{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-solid" style={{ marginTop: "0.5rem" }}>
        {loading ? "Saving..." : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#999", marginBottom: "0.5rem" }}>gaia.solutions</p>
        <h1 className="t-display-md" style={{ marginBottom: "1.75rem" }}>Set new password</h1>
        <Suspense fallback={<p className="t-body" style={{ color: "#888" }}>Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
