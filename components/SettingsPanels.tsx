"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/client";
import { when } from "@/lib/format";
import type { Channel, SessionRow } from "@/lib/types";

export function SessionsList({ sessions }: { sessions: SessionRow[] }) {
  const router = useRouter();
  const [err, setErr] = useState("");
  async function revoke(sid: string) {
    try {
      await call(`auth/sessions/${sid}`, "DELETE");
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    }
  }
  return (
    <div className="space-y-2">
      {sessions.map((s) => (
        <div key={s.sid} className="card flex items-center justify-between gap-3 text-sm">
          <div className="min-w-0">
            <div className="truncate">{s.ua || "unknown device"}{s.current && <span className="ml-2 text-xs text-emerald-300">this device</span>}</div>
            <div className="text-xs text-muted">{s.ip} · signed in {when(new Date(s.created * 1000).toISOString())}</div>
          </div>
          {!s.current && <button className="btn-danger" onClick={() => revoke(s.sid)}>Sign out</button>}
        </div>
      ))}
      {err && <p className="text-sm text-red-300" role="alert">{err}</p>}
    </div>
  );
}

export function ChannelSettings({ channel }: { channel: Channel }) {
  const router = useRouter();
  const [cap, setCap] = useState(channel.daily_cap?.toString() ?? "");
  const [min, setMin] = useState(channel.research_min_pending?.toString() ?? "");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setMsg("");
    try {
      await call(`channels/${channel.id}`, "PATCH", {
        daily_cap: cap === "" ? null : Number(cap),
        research_min_pending: min === "" ? null : Number(min),
      });
      setMsg("Saved");
      router.refresh();
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card space-y-3">
      <div className="font-medium">{channel.display_name || channel.id}</div>
      <div className="text-xs text-muted">{channel.youtube_channel} · {channel.instagram_handle}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor={`cap-${channel.id}`}>New reels per day (blank = default)</label>
          <input id={`cap-${channel.id}`} type="number" min={0} max={50} className="input" value={cap} onChange={(e) => setCap(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor={`min-${channel.id}`}>Find new ideas when fewer than (blank = default)</label>
          <input id={`min-${channel.id}`} type="number" min={0} max={100} className="input" value={min} onChange={(e) => setMin(e.target.value)} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-primary" disabled={busy} onClick={save}>Save</button>
        {msg && <span className="text-sm text-muted" role="status">{msg}</span>}
      </div>
    </div>
  );
}
