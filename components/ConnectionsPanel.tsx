"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/client";
import { ago } from "@/lib/format";
import type { Connection, PublishingStatus } from "@/lib/types";

const COPY: Record<string, string> = {
  youtube: "Upload approved reels as Shorts to the connected YouTube channel.",
  instagram: "Post approved reels as Reels to the connected Instagram Business or Creator account.",
};

export function ConnectionsPanel({ channelId, connections, status, notice }: { channelId: string; connections: Connection[]; status: PublishingStatus; notice?: { ok?: string; error?: string } }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState(notice?.error ?? "");

  async function connect(platform: string) {
    setBusy(platform);
    setErr("");
    try {
      const { url } = await call<{ url: string }>(`channels/${channelId}/connections/${platform}/start`, "POST", {});
      window.location.href = url; // off to Google / Facebook; they send the person back to /api/connect/<platform>/callback
    } catch (e) {
      setErr((e as Error).message);
      setBusy("");
    }
  }

  async function disconnect(platform: string, name: string) {
    if (!window.confirm(`Disconnect ${name}? Reels already posted stay up. New reels can't be published there until you connect again.`)) return;
    setBusy(platform);
    setErr("");
    try {
      await call(`channels/${channelId}/connections/${platform}`, "DELETE");
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">Publishing accounts</h2>
      {notice?.ok && <p className="text-sm text-emerald-300" role="status">{notice.ok}</p>}
      {err && <p className="text-sm text-red-300" role="alert">{err}</p>}
      {!status.encryption && <p className="text-sm text-amber-300">The server has no TOKEN_ENC_KEY yet, so accounts can't be connected safely.</p>}
      {!status.app_url && <p className="text-sm text-amber-300">The server has no APP_URL yet, so the sign-in can't return to this app.</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {status.platforms.map((p) => {
          const c = connections.find((x) => x.platform === p.id);
          const needs = c?.status === "needs_reconnect";
          return (
            <div key={p.id} className="card space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{p.label}</span>
                {c && !needs && <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs text-emerald-300">Connected</span>}
                {needs && <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs text-amber-300">Reconnect needed</span>}
              </div>
              <p className="text-xs text-muted">{c ? <>Posting as <span className="text-white">{c.account_name}</span> · connected {ago(c.connected_at)}</> : COPY[p.id]}</p>
              {!p.configured && (
                <p className="text-xs text-amber-300">Not set up on the server yet: the {p.label} app credentials are missing from .env (see docs/publishing-setup.md).{p.redirect_uri && <> Redirect address to register: <code className="break-all">{p.redirect_uri}</code></>}</p>
              )}
              <div className="flex gap-2">
                <button className={c && !needs ? "btn-ghost" : "btn-primary"} disabled={!!busy || !p.configured || !status.app_url || !status.encryption} onClick={() => connect(p.id)}>
                  {busy === p.id ? "Opening..." : c ? "Reconnect" : `Connect ${p.label}`}
                </button>
                {c && <button className="btn-danger" disabled={!!busy} onClick={() => disconnect(p.id, p.label)}>Disconnect</button>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
