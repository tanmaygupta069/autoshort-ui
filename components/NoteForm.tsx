"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/client";

export function NoteForm({ topicId, draftNo }: { topicId: string; draftNo?: number }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await call(`topics/${topicId}/notes`, "POST", { body, draft_no: draftNo });
      setBody("");
      router.refresh();
    } catch (er) {
      setErr((er as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-2">
      <textarea className="input min-h-20" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Leave a note for the team..." aria-label="Note" />
      <div className="flex items-center gap-3">
        <button className="btn-ghost" disabled={busy || !body.trim()}>Add note</button>
        {err && <span className="text-sm text-red-300" role="alert">{err}</span>}
      </div>
    </form>
  );
}
