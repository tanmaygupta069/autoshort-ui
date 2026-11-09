"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/client";
import type { Topic } from "@/lib/types";

export function IdeaActions({ t, isAdmin, compact = false }: { t: Topic; isAdmin: boolean; compact?: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [topic, setTopic] = useState(t.topic);
  const [notes, setNotes] = useState(t.notes_for_ai);
  const [priority, setPriority] = useState(t.priority);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setErr("");
    try {
      await fn();
      setEditing(false);
      setRejecting(false);
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const review = (action: "approve" | "reject") => run(() => call(`topics/${t.topic_id}/review`, "POST", { action, note }));
  const save = () => run(() => call(`topics/${t.topic_id}`, "PATCH", { topic, notes_for_ai: notes, priority, version: t.version }));
  const canEdit = ["proposed", "queued", "failed"].includes(t.status);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {t.status === "proposed" && (
          <>
            <button className="btn-ok" disabled={busy} onClick={() => review("approve")}>Approve</button>
            <button className="btn-danger" disabled={busy} onClick={() => setRejecting(!rejecting)}>Reject</button>
          </>
        )}
        {t.status === "failed" && isAdmin && (
          <button className="btn-primary" disabled={busy} onClick={() => run(() => call(`topics/${t.topic_id}/retry`, "POST"))}>Retry</button>
        )}
        {canEdit && !compact && <button className="btn-ghost" onClick={() => setEditing(!editing)}>{editing ? "Close editor" : "Edit idea"}</button>}
      </div>
      {t.status === "proposed" && !compact && (
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note with your decision" aria-label="Decision note" />
      )}
      {rejecting && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">Reject this idea?</span>
          <button className="btn-danger" disabled={busy} onClick={() => review("reject")}>Yes, reject</button>
          <button className="btn-ghost" onClick={() => setRejecting(false)}>No</button>
        </div>
      )}
      {editing && (
        <div className="card space-y-3">
          <div>
            <label className="label" htmlFor={`t-${t.topic_id}`}>Idea</label>
            <input id={`t-${t.topic_id}`} className="input" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor={`n-${t.topic_id}`}>Brief for the producer (hook, beats, caveats)</label>
            <textarea id={`n-${t.topic_id}`} className="input min-h-32" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="w-28">
            <label className="label" htmlFor={`p-${t.topic_id}`}>Priority (1 = first)</label>
            <input id={`p-${t.topic_id}`} type="number" min={1} max={9} className="input" value={priority} onChange={(e) => setPriority(Number(e.target.value))} />
          </div>
          <button className="btn-primary" disabled={busy || topic.trim().length < 3} onClick={save}>Save changes</button>
        </div>
      )}
      {err && <p className="text-sm text-red-300" role="alert">{err}</p>}
    </div>
  );
}
