"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteSprintButton({ id, number, storyCount }: { id: string; number: number; storyCount: number }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function onDelete() {
    const msg = storyCount > 0
      ? `Delete Sprint ${number}? ${storyCount} stor${storyCount === 1 ? "y" : "ies"} will be unassigned from it (they stay on the board).`
      : `Delete Sprint ${number}?`;
    if (!confirm(msg)) return;
    setDeleting(true);
    await fetch(`/api/sprints/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={onDelete}
      disabled={deleting}
      style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#888", background: "none", border: "none", cursor: "pointer" }}
      title="Delete sprint"
    >
      {deleting ? "…" : "✕"}
    </button>
  );
}
