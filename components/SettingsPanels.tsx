"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PixelInstagram, PixelYouTube } from "@/components/PixelLogos";
import { call } from "@/lib/client";
import { when } from "@/lib/format";
import type { Channel, SessionRow } from "@/lib/types";

function parseUa(ua: string) {
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\/|Opera/.test(ua) ? "Opera" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\/|CriOS/.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad|iOS/.test(ua) ? "iOS" : /Mac OS X|Macintosh/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  const mobile = /Mobi|Android|iPhone|iPad/.test(ua);
  return { browser, os, mobile };
}

function PixelDevice({ mobile }: { mobile: boolean }) {
  const c = "currentColor";
  return (
    <svg viewBox="0 0 16 16" className="size-10 shrink-0 text-accent" shapeRendering="crispEdges" aria-hidden="true">
      {mobile ? (
        <>
          <rect x="4" y="1" width="8" height="1" fill={c} /><rect x="4" y="14" width="8" height="1" fill={c} />
          <rect x="4" y="1" width="1" height="14" fill={c} /><rect x="11" y="1" width="1" height="14" fill={c} />
          <rect x="6" y="3" width="4" height="1" fill={c} opacity=".5" /><rect x="7" y="12" width="2" height="1" fill={c} />
        </>
      ) : (
        <>
          <rect x="1" y="2" width="14" height="1" fill={c} /><rect x="1" y="10" width="14" height="1" fill={c} />
          <rect x="1" y="2" width="1" height="9" fill={c} /><rect x="14" y="2" width="1" height="9" fill={c} />
          <rect x="3" y="4" width="6" height="1" fill={c} opacity=".5" /><rect x="3" y="6" width="9" height="1" fill={c} opacity=".5" />
          <rect x="7" y="11" width="2" height="2" fill={c} /><rect x="4" y="13" width="8" height="1" fill={c} />
        </>
      )}
    </svg>
  );
}

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
    <div className="space-y-3">
      {sessions.map((s) => {
        const d = parseUa(s.ua || "");
        return (
          <div key={s.sid} className="card flex items-center gap-4 text-sm">
            <PixelDevice mobile={d.mobile} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-xs">{s.ua ? d.browser : "Unknown device"}</span>
                {d.os && <span className="text-muted">on {d.os}</span>}
                {s.current && <span className="border-2 border-black bg-emerald-500/30 px-1.5 font-mono text-base leading-tight text-emerald-200">this device</span>}
              </div>
              <div className="mt-1 text-xs text-muted">{s.ip} · signed in {when(new Date(s.created * 1000).toISOString())}</div>
            </div>
            {!s.current && <button className="btn-danger" onClick={() => revoke(s.sid)}>Sign out</button>}
          </div>
        );
      })}
      {err && <p className="text-sm text-red-300" role="alert">{err}</p>}
    </div>
  );
}

function Stepper({ id, label, hint, value, onChange, min, max }: { id: string; label: string; hint: string; value: string; onChange: (v: string) => void; min: number; max: number }) {
  const n = value === "" ? null : Number(value);
  const set = (v: number) => onChange(String(Math.min(max, Math.max(min, v))));
  return (
    <div className="border-2 border-line bg-surface2 p-3">
      <label className="label !mb-0" htmlFor={id}>{label}</label>
      <p className="mb-3 mt-1 text-sm text-muted">{hint}</p>
      <div className="flex items-stretch gap-2">
        <button type="button" aria-label={`Decrease ${label}`} className="btn-ghost !px-3 !py-1" disabled={n === null || n <= min} onClick={() => set((n ?? min) - 1)}>-</button>
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          placeholder="auto"
          className="input !w-20 text-center font-display [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="button" aria-label={`Increase ${label}`} className="btn-ghost !px-3 !py-1" disabled={n !== null && n >= max} onClick={() => set((n ?? Math.max(min, 0)) + 1)}>+</button>
        <button type="button" className="ml-auto text-sm uppercase text-muted hover:text-white disabled:opacity-40" disabled={value === ""} onClick={() => onChange("")}>
          {value === "" ? "Using default" : "Reset to default"}
        </button>
      </div>
    </div>
  );
}

function AutoPublish({ channel }: { channel: Channel }) {
  const router = useRouter();
  const [on, setOn] = useState(!!channel.auto_publish);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function flip() {
    const next = !on;
    setOn(next);
    setBusy(true);
    setErr("");
    try {
      await call(`channels/${channel.id}`, "PATCH", { auto_publish: next });
      router.refresh();
    } catch (e) {
      setOn(!next);
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex items-center justify-between gap-4 border-2 border-line bg-surface2 p-3">
      <div>
        <div className="label !mb-0">Auto publish</div>
        <p className="mt-1 text-sm text-muted">Post a reel to every connected account the moment it is approved.</p>
        {err && <p className="mt-1 text-sm text-red-300" role="alert">{err}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Auto publish"
        disabled={busy}
        onClick={flip}
        className={`relative h-8 w-16 shrink-0 border-2 border-black transition disabled:opacity-60 ${on ? "bg-emerald-500" : "bg-line"}`}
      >
        <span className={`absolute top-0.5 size-6 border-2 border-black bg-white transition-all ${on ? "left-[calc(100%-1.625rem)]" : "left-0.5"}`} />
        <span className="sr-only">{on ? "On" : "Off"}</span>
      </button>
    </div>
  );
}

export function ChannelSettings({ channel }: { channel: Channel }) {
  const router = useRouter();
  const [cap, setCap] = useState(channel.daily_cap?.toString() ?? "");
  const [min, setMin] = useState(channel.research_min_pending?.toString() ?? "");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const dirty = cap !== (channel.daily_cap?.toString() ?? "") || min !== (channel.research_min_pending?.toString() ?? "");
  const name = channel.display_name || channel.id;
  const handles = [
    { key: "youtube", text: channel.youtube_channel },
    { key: "instagram", text: channel.instagram_handle },
  ].filter((h) => h.text && h.text.trim().length > 1);

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
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center border-2 border-black bg-accent font-display text-sm shadow-[3px_3px_0_#000]">{name.charAt(0).toUpperCase()}</div>
        <div className="min-w-0">
          <div className="truncate font-display text-xs">{name}</div>
          {handles.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {handles.map((h) => (
                <span key={h.key} className="flex items-center gap-1.5 border-2 border-line px-1.5 font-mono text-base leading-tight text-muted">
                  {h.key === "youtube" ? <PixelYouTube className="size-5" /> : <PixelInstagram className="size-5" />}
                  {h.text}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <AutoPublish channel={channel} />
      <div className="grid gap-3 lg:grid-cols-2">
        <Stepper id={`cap-${channel.id}`} label="Reels per day" hint="How many new reels get made each day." value={cap} onChange={setCap} min={0} max={50} />
        <Stepper id={`min-${channel.id}`} label="Idea refill level" hint="Look for new ideas when fewer than this are waiting." value={min} onChange={setMin} min={0} max={100} />
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-primary" disabled={busy || !dirty} onClick={save}>{busy ? "Saving..." : "Save"}</button>
        {msg ? <span className="text-sm text-muted" role="status">{msg}</span> : dirty && <span className="text-sm text-amber">Unsaved changes</span>}
      </div>
    </div>
  );
}
