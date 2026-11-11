"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/client";
import type { Channel } from "@/lib/types";

type Profile = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export function ChannelProfile({ channel, profile }: { channel: Channel; profile: Profile | null }) {
  const router = useRouter();
  const [text, setText] = useState(profile ? JSON.stringify(profile, null, 2) : "");
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  // while the profile is being drafted, check back every few seconds
  useEffect(() => {
    if (channel.status !== "generating") return;
    const t = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(t);
  }, [channel.status, router]);

  // a freshly drafted profile arrives after a refresh: show it
  useEffect(() => {
    setText(profile ? JSON.stringify(profile, null, 2) : "");
  }, [profile]);

  async function run(fn: () => Promise<unknown>, done: string) {
    setBusy(true);
    setErr("");
    setNote("");
    try {
      await fn();
      setNote(done);
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function parsed(): Profile {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("The profile is not valid JSON. Check commas and quotes.");
    }
  }

  if (channel.status === "generating") {
    return <div className="card text-sm text-muted" role="status">Drafting the profile. This takes a minute or two; this page updates by itself.</div>;
  }

  const p = profile ?? {};
  const theme = p.visual?.theme ?? {};
  const swatches = [theme.primaryColor, theme.accentColor, theme.backgroundColor, theme.surfaceColor, ...(theme.chartColors ?? [])].filter(Boolean);

  return (
    <div className="space-y-6">
      {channel.status === "failed" && (
        <div className="card space-y-2 border-red-500/40">
          <p className="text-sm text-red-300">The draft failed: {channel.profile_error || "unknown reason"}</p>
          <button className="btn-primary" disabled={busy} onClick={() => run(() => call(`channels/${channel.id}/regenerate`, "POST", {}), "Drafting again")}>Try again</button>
        </div>
      )}

      {profile && (
        <>
          <section className="card space-y-3 text-sm">
            <div><div className="label">Niche</div>{p.niche}</div>
            <div><div className="label">Research keywords</div>{(p.research?.keywords ?? []).join(" · ")}</div>
            <div><div className="label">What makes a good idea</div><span className="text-muted">{p.research?.idea_rules}</span></div>
            <div><div className="label">Voice</div><span className="text-muted">{p.voice_and_tone?.persona}</span></div>
            <div><div className="label">Hook rule</div><span className="text-muted">{p.voice_and_tone?.hook_rule}</span></div>
            <div><div className="label">Background music</div><span className="text-muted">{p.audio?.music?.mode === "rotate" ? `a different track each reel, from: ${(p.audio.music.vibes ?? []).join(", ")}` : "one fixed track"}</span></div>
            <div><div className="label">What the scenes can show</div><span className="text-muted">{p.visual?.scene_limits}</span></div>
            <div className="flex items-center gap-2">
              <div className="label !mb-0">Palette</div>
              {swatches.map((c: string, i: number) => <span key={i} title={c} className="h-5 w-5 rounded border border-line" style={{ background: c }} />)}
            </div>
          </section>

          <section className="space-y-2">
            <label className="label" htmlFor="pj">Full profile (advanced, edit if you need to)</label>
            <textarea id="pj" className="input h-80 font-mono text-xs" spellCheck={false} value={text} onChange={(e) => setText(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <button className="btn-ghost" disabled={busy} onClick={() => run(() => call(`channels/${channel.id}/profile`, "PUT", { profile: parsed() }), "Saved")}>Save changes</button>
              {channel.status === "ready" && (
                <button className="btn-ok" disabled={busy} onClick={() => run(async () => {
                  await call(`channels/${channel.id}/profile`, "PUT", { profile: parsed() });
                  await call(`channels/${channel.id}/activate`, "POST", {});
                }, "Channel is live: research starts on its own")}>Approve and activate</button>
              )}
              {channel.status === "ready" && (
                <button className="btn-ghost" disabled={busy} onClick={() => run(() => call(`channels/${channel.id}/regenerate`, "POST", {}), "Drafting again")}>Draft again</button>
              )}
            </div>
          </section>
        </>
      )}
      {err && <p className="text-sm text-red-300" role="alert">{err}</p>}
      {note && <p className="text-sm text-emerald-300" role="status">{note}</p>}
    </div>
  );
}
