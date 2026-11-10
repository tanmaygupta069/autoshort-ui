"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/client";
import type { Channel } from "@/lib/types";

export function ChannelNew() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ display_name: "", niche: "", audience: "", tone: "", youtube_channel: "", instagram_handle: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const ch = await call<Channel>("channels", "POST", { ...f, style_pack: "generic" });
      router.push(`/admin/channels/${ch.id}`);
      router.refresh();
    } catch (e2) {
      setErr((e2 as Error).message);
      setBusy(false);
    }
  }

  if (!open) return <button className="btn-primary" onClick={() => setOpen(true)}>New channel</button>;

  return (
    <form onSubmit={create} className="card space-y-4">
      <p className="text-sm text-muted">Give the basics. We draft the full channel profile (research keywords, voice, tone, look) for you to review before anything is made.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="cn">Channel name</label>
          <input id="cn" required minLength={2} maxLength={80} className="input" value={f.display_name} onChange={set("display_name")} placeholder="Money Basics" />
        </div>
        <div>
          <label className="label" htmlFor="ci">Niche</label>
          <input id="ci" required minLength={3} maxLength={300} className="input" value={f.niche} onChange={set("niche")} placeholder="Personal finance for beginners" />
        </div>
        <div>
          <label className="label" htmlFor="ca">Audience (optional)</label>
          <input id="ca" maxLength={300} className="input" value={f.audience} onChange={set("audience")} placeholder="People in their 20s starting to save" />
        </div>
        <div>
          <label className="label" htmlFor="ct">Tone (optional)</label>
          <input id="ct" maxLength={300} className="input" value={f.tone} onChange={set("tone")} placeholder="Friendly, plain words, no jargon" />
        </div>
        <div>
          <label className="label" htmlFor="cy">YouTube channel (optional)</label>
          <input id="cy" maxLength={100} className="input" value={f.youtube_channel} onChange={set("youtube_channel")} />
        </div>
        <div>
          <label className="label" htmlFor="cg">Instagram handle (optional)</label>
          <input id="cg" maxLength={100} className="input" value={f.instagram_handle} onChange={set("instagram_handle")} />
        </div>
      </div>
      <p className="text-xs text-muted">Look: the general explainer style (headlines, numbers, comparisons, callouts). Niche-specific looks are added per channel later.</p>
      {err && <p className="text-sm text-red-300" role="alert">{err}</p>}
      <div className="flex gap-2">
        <button className="btn-primary" disabled={busy}>{busy ? "Creating..." : "Create and draft profile"}</button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
