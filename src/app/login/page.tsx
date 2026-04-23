"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/handbook");
      router.refresh();
    }
  }

  return (
    <div style={{ maxWidth: "420px", margin: "3rem auto" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>Sign in</h1>
      <p style={{ marginBottom: "2rem" }}>Welcome back to gaia.solutions</p>

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required placeholder="you@example.com" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              required
              style={{ paddingRight: "3rem" }}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              style={{
                position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--color-text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-sans)",
              }}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        {error && <div className="alert alert--error">{error}</div>}
        <button type="submit" disabled={loading} className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
        No account?{" "}
        <Link href="/register" style={{ color: "var(--color-dome-gold)" }}>Get started</Link>
      </p>
    </div>
  );
}
