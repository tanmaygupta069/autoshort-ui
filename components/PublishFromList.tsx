"use client";

import { useState } from "react";
import { PublishPanel } from "@/components/PublishPanel";
import { call } from "@/lib/client";
import type { Connection, Publication } from "@/lib/types";

/** Publish button for a row in the reel list: loads accounts and past posts on click, then opens the publish popup. */
export function PublishFromList({ topicId, draftNo, channelId, published }: { topicId: string; draftNo: number; channelId: string; published: boolean }) {
  const [data, setData] = useState<{ c: Connection[]; p: Publication[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function open() {
    setBusy(true);
    setErr("");
    try {
      const [c, p] = await Promise.all([
        call<Connection[]>(`channels/${channelId}/connections`, "GET").catch(() => [] as Connection[]),
        call<Publication[]>(`drafts/${topicId}/${draftNo}/publications`, "GET"),
      ]);
      setData({ c, p });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      {!data && <button className={published ? "btn-ghost" : "btn-ok"} disabled={busy} onClick={open}>{busy ? "..." : published ? "Posts" : "Publish"}</button>}
      {data && <PublishPanel autoOpen onClose={() => setData(null)} topicId={topicId} draftNo={draftNo} channelId={channelId} isAdmin connections={data.c} publications={data.p} />}
      {err && <span className="text-xs text-red-300" role="alert">{err}</span>}
    </div>
  );
}
