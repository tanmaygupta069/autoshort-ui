"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/client";
import type { Channel } from "@/lib/types";

export function AddIdea({ channels }: { channels: Channel[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState(channels[0]?.id ?? "");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState(3);
  const [startNow, setStartNow] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await call("topics", "POST", { channel, topic, notes_for_ai: notes, priority, start_now: startNow });
      setTopic("");
      setNotes("");
      setOpen(false);
      router.refresh();
    } catch (er) {
      setErr((er as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!open) return <button className="btn-primary" onClick={() => setOpen(true)}>Add idea</button>;
  return (
    <form onSubmit={add} className="card space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
        <div>
          <label className="label" htmlFor="ch">Channel</label>
          <select id="ch" className="input" value={channel} onChange={(e) => setChannel(e.target.value)}>
            {channels.map((c) => <option key={c.id} value={c.id}>{c.display_name || c.id}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="pr">Priority</label>
          <input id="pr" type="number" min={1} max={9} className="input" value={priority} onChange={(e) => setPriority(Number(e.target.value))} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="ti">Idea (a claim or a question)</label>
        <input id="ti" required minLength={3} className="input" value={topic} onChange={(e) => setTopic(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="no">Brief for the producer (optional)</label>
        <textarea id="no" className="input min-h-24" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={startNow} onChange={(e) => setStartNow(e.target.checked)} />
        Start producing right away (otherwise it waits for a reviewer)
      </label>
      <div className="flex items-center gap-2">
        <button className="btn-primary" disabled={busy}>Add</button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
        {err && <span className="text-sm text-red-300" role="alert">{err}</span>}
      </div>
    </form>
  );
}
