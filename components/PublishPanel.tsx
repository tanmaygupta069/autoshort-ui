"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/Confirm";
import { call } from "@/lib/client";
import { ago } from "@/lib/format";
import { PixelInstagram, PixelYouTube } from "@/components/PixelLogos";
import type { Connection, Publication } from "@/lib/types";

const LABEL: Record<string, string> = { youtube: "YouTube", instagram: "Instagram" };
const TONE: Record<string, string> = {
  queued: "bg-sky-500/15 text-sky-300",
  publishing: "bg-violet-500/15 text-violet-300",
  published: "bg-emerald-500/15 text-emerald-300",
  failed: "bg-red-500/15 text-red-300",
};

export function PublishPanel({ topicId, draftNo, channelId, isAdmin, connections, publications, autoOpen, onClose }: {
  topicId: string; draftNo: number; channelId: string; isAdmin: boolean; connections: Connection[]; publications: Publication[]; autoOpen?: boolean; onClose?: () => void;
}) {
  const router = useRouter();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const dlg = useRef<HTMLDialogElement>(null);
  const live = connections.filter((c) => c.status === "connected");
  const pubOf = (p: string) => publications.find((x) => x.platform === p);
  const open = (p: string) => !pubOf(p) || pubOf(p)!.status === "failed"; // can (re)publish here
  const [pick, setPick] = useState<string[]>(() => live.map((c) => c.platform).filter(open));
  const [privacy, setPrivacy] = useState("public");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (autoOpen) dlg.current?.showModal();
  }, [autoOpen]);

  // while something is being posted, check back every few seconds
  const working = publications.some((x) => x.status === "queued" || x.status === "publishing");
  useEffect(() => {
    if (!working) return;
    const t = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(t);
  }, [working, router]);

  async function publish(platforms: string[]) {
    const where = platforms.map((p) => `${LABEL[p]} (${connections.find((c) => c.platform === p)?.account_name})`).join(" and ");
    if (!(await confirm({ title: "Post this reel?", body: `This publishes it to ${where} for real.`, confirmLabel: "Publish" }))) return;
    setBusy(true);
    setErr("");
    try {
      await call(`drafts/${topicId}/${draftNo}/publish`, "POST", { platforms, privacy });
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const toggle = (p: string) => setPick((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));
  const canPublish = isAdmin && pick.length > 0 && !busy;

  return (
    <>
      {!autoOpen && <button className="btn-ok" onClick={() => dlg.current?.showModal()}>Publish</button>}
      <dialog
        ref={dlg}
        onClose={() => onClose?.()}
        onClick={(e) => { if (e.target === dlg.current) dlg.current?.close(); }}
        className="m-auto w-[min(34rem,92vw)] border-2 border-black bg-surface p-0 text-white shadow-[8px_8px_0_#000] backdrop:bg-black/70"
      >
    <section className="space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2>Publish to</h2>
        <button type="button" aria-label="Close" className="btn-ghost !px-2.5 !py-1" onClick={() => dlg.current?.close()}>X</button>
      </div>

      {publications.length > 0 && (
        <ul className="space-y-2">
          {publications.map((x) => (
            <li key={x.id} className="space-y-1 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{LABEL[x.platform]}</span>
                <span className="flex items-center gap-2">
                  {x.url && <a href={x.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">Open the post</a>}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs ${TONE[x.status]}`}>{x.status}</span>
                </span>
              </div>
              {x.status === "published" && x.note && <p className="text-xs text-amber-300">{x.note}</p>}
              {x.status === "failed" && <p className="text-xs text-red-300">{x.error || "failed"} · attempt {x.attempts} · {ago(x.finished_at)}</p>}
              {x.status === "failed" && isAdmin && connections.find((c) => c.platform === x.platform)?.status === "connected" && (
                <button className="btn-ghost" disabled={busy} onClick={() => publish([x.platform])}>Try again</button>
              )}
            </li>
          ))}
        </ul>
      )}

      {isAdmin && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {["youtube", "instagram"].map((p) => {
              const c = connections.find((x) => x.platform === p);
              const ok = c?.status === "connected";
              const done = !open(p);
              const on = ok && !done && pick.includes(p);
              return (
                <div key={p} className={`flex flex-col items-center gap-3 border-2 p-4 text-center ${on ? "border-accent bg-surface2 shadow-[4px_4px_0_#000]" : "border-line bg-surface2/50"} ${ok && !done ? "" : "opacity-70"}`}>
                  <button
                    type="button"
                    aria-pressed={on}
                    disabled={!ok || done}
                    onClick={() => toggle(p)}
                    className="flex flex-col items-center gap-3 disabled:cursor-not-allowed"
                  >
                    {p === "youtube" ? <PixelYouTube on={on} /> : <PixelInstagram on={on} />}
                    <span className="font-display text-xs">{LABEL[p]}</span>
                  </button>
                  <span className="text-xs text-muted">
                    {done ? "already posted" : ok ? c!.account_name : <>{c ? "needs reconnecting" : "not connected"}<br /><Link className="text-accent hover:underline" href={`/admin/channels/${channelId}`}>connect on the channel page</Link></>}
                  </span>
                  {ok && !done && <span className={`border-2 border-black px-2 font-mono text-base leading-tight ${on ? "bg-accent text-white" : "bg-line text-muted"}`}>{on ? "selected" : "tap to select"}</span>}
                </div>
              );
            })}
          </div>
          {open("youtube") && pick.includes("youtube") && (
            <div className="flex items-center gap-2 text-sm">
              <label htmlFor="priv" className="text-xs text-muted">YouTube visibility</label>
              <select id="priv" className="input w-auto" value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>
          )}
          {["youtube", "instagram"].some(open) ? (
            <button className="btn-ok" disabled={!canPublish} onClick={() => publish(pick)}>{busy ? "Starting..." : "Publish now"}</button>
          ) : (
            <p className="text-sm text-muted">Published to every connected platform.</p>
          )}
        </div>
      )}
      {!isAdmin && publications.length === 0 && <p className="text-sm text-muted">Only an admin can publish.</p>}
      {err && <p className="text-sm text-red-300" role="alert">{err}</p>}
    </section>
      </dialog>
      {confirmDialog}
    </>
  );
}

export function PublishLocked() {
  return <button className="btn-ok" disabled title="Approve this reel before publishing">Publish</button>;
}
