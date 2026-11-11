"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/client";
import { ago } from "@/lib/format";
import type { Connection, Publication } from "@/lib/types";

const LABEL: Record<string, string> = { youtube: "YouTube", instagram: "Instagram" };
const TONE: Record<string, string> = {
  queued: "bg-sky-500/15 text-sky-300",
  publishing: "bg-violet-500/15 text-violet-300",
  published: "bg-emerald-500/15 text-emerald-300",
  failed: "bg-red-500/15 text-red-300",
};

export function PublishPanel({ topicId, draftNo, channelId, isAdmin, connections, publications }: {
  topicId: string; draftNo: number; channelId: string; isAdmin: boolean; connections: Connection[]; publications: Publication[];
}) {
  const router = useRouter();
  const live = connections.filter((c) => c.status === "connected");
  const pubOf = (p: string) => publications.find((x) => x.platform === p);
  const open = (p: string) => !pubOf(p) || pubOf(p)!.status === "failed"; // can (re)publish here
  const [pick, setPick] = useState<string[]>(() => live.map((c) => c.platform).filter(open));
  const [privacy, setPrivacy] = useState("public");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // while something is being posted, check back every few seconds
  const working = publications.some((x) => x.status === "queued" || x.status === "publishing");
  useEffect(() => {
    if (!working) return;
    const t = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(t);
  }, [working, router]);

  async function publish(platforms: string[]) {
    const where = platforms.map((p) => `${LABEL[p]} (${connections.find((c) => c.platform === p)?.account_name})`).join(" and ");
    if (!window.confirm(`Post this reel to ${where} now? This publishes it for real.`)) return;
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
    <section className="card space-y-4">
      <h2 className="text-sm font-semibold">Publish</h2>

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
          {["youtube", "instagram"].filter(open).map((p) => {
            const c = connections.find((x) => x.platform === p);
            const ok = c?.status === "connected";
            return (
              <label key={p} className={`flex items-center gap-3 text-sm ${ok ? "" : "opacity-60"}`}>
                <input type="checkbox" disabled={!ok} checked={ok && pick.includes(p)} onChange={() => toggle(p)} />
                <span>{LABEL[p]}</span>
                <span className="text-xs text-muted">
                  {ok ? c!.account_name : <>{c ? "needs reconnecting" : "not connected"} · <Link className="text-accent hover:underline" href={`/admin/channels/${channelId}`}>connect it on the channel page</Link></>}
                </span>
              </label>
            );
          })}
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
  );
}
