"use client";

import { signOut } from "next-auth/react";

export default function AppSignOut() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.08em", color: "#666", background: "none", border: "none", cursor: "pointer", padding: 0 }}
    >
      Sign out
    </button>
  );
}
