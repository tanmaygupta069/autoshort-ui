"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/Confirm";
import { call } from "@/lib/client";
import { ago } from "@/lib/format";
import { PixelInstagram, PixelYouTube } from "@/components/PixelLogos";
import type { Connection, PublishingStatus } from "@/lib/types";

const COPY: Record<string, string> = {
  youtube: "Upload approved reels as Shorts to the connected YouTube channel.",
  instagram: "Post approved reels as Reels to the connected Instagram Business or Creator account.",
};

export function ConnectionsPanel({ channelId, connections, status, notice }: { channelId: string; connections: Connection[]; status: PublishingStatus; notice?: { ok?: string; error?: string } }) {
  const router = useRouter();
  const { confirm, dialog: confirmDialog } = useConfirm();
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
    if (!(await confirm({ title: `Disconnect ${name}?`, body: "Reels already posted stay up. New reels can't be published there until you connect again.", confirmLabel: "Disconnect", danger: true }))) return;
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
      <h2>Publishing accounts</h2>
      {notice?.ok && <p className="text-sm text-emerald-300" role="status">{notice.ok}</p>}
      {err && <p className="text-sm text-red-300" role="alert">{err}</p>}
      {!status.encryption && <p className="text-sm text-amber-300">The server has no TOKEN_ENC_KEY yet, so accounts can't be connected safely.</p>}
      {!status.app_url && <p className="text-sm text-amber-300">The server has no APP_URL yet, so the sign-in can't return to this app.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {[...status.platforms].sort((x, y) => (x.id === "youtube" ? -1 : y.id === "youtube" ? 1 : 0)).map((p) => {
          const c = connections.find((x) => x.platform === p.id);
          const needs = c?.status === "needs_reconnect";
          return (
            <div key={p.id} className="card flex flex-col items-center space-y-3 text-center">
              {p.id === "youtube" ? <PixelYouTube on={!!c && !needs} /> : <PixelInstagram on={!!c && !needs} />}
              <div className="flex items-center justify-center gap-2">
                <span className="font-display text-xs">{p.label}</span>
                {c && !needs && <span className="border-2 border-black bg-emerald-500/30 px-1.5 font-mono text-base leading-tight text-emerald-200">Connected</span>}
                {needs && <span className="border-2 border-black bg-amber-500/30 px-1.5 font-mono text-base leading-tight text-amber-200">Reconnect needed</span>}
              </div>
              <p className="text-sm text-muted">{c ? <>Posting as <span className="text-white">{c.account_name}</span> · connected {ago(c.connected_at)}</> : COPY[p.id]}</p>
              {!p.configured && (
                <p className="text-xs text-amber-300">Not set up on the server yet: the {p.label} app credentials are missing from .env (see docs/publishing-setup.md).{p.redirect_uri && <> Redirect address to register: <code className="break-all">{p.redirect_uri}</code></>}</p>
              )}
              <div className="mt-auto flex flex-wrap justify-center gap-2 pt-1">
                <button className={c && !needs ? "btn-ghost" : "btn-primary"} disabled={!!busy || !p.configured || !status.app_url || !status.encryption} onClick={() => connect(p.id)}>
                  {busy === p.id ? "Opening..." : c ? "Reconnect" : "Connect"}
                </button>
                {c && <button className="btn-danger" disabled={!!busy} onClick={() => disconnect(p.id, p.label)}>Disconnect</button>}
              </div>
            </div>
          );
        })}
      </div>
      {confirmDialog}
    </section>
  );
}
