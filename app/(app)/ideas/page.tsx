import Link from "next/link";
import { AddIdea } from "@/components/AddIdea";
import { Badge } from "@/components/Badge";
import { IdeaActions } from "@/components/IdeaActions";
import { getJson } from "@/lib/server/api";
import { selectedChannel, withChannel } from "@/lib/server/channel";
import type { Channel, Me, Topic } from "@/lib/types";

const TABS = [
  ["proposed", "To approve"],
  ["queued", "Approved - queued"],
  ["in_progress", "Being made"],
  ["failed", "Failed"],
  ["rejected", "Rejected"],
  ["", "All"],
] as const;

export default async function Ideas({ searchParams }: PageProps<"/ideas">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "proposed";
  const channel = await selectedChannel(sp);
  const [me, topics] = await Promise.all([
    getJson<Me>("/me"),
    getJson<Topic[]>(withChannel(`/topics${status ? `?status=${encodeURIComponent(status)}` : ""}`, channel)),
  ]);
  const channels = me.role === "admin" ? (await getJson<Channel[]>("/channels")).filter((c) => c.status === "active") : []; // ideas only go to live channels
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Ideas</h1>
      </div>
      {me.role === "admin" && channels.length > 0 && <AddIdea channels={channels} defaultChannel={channel} />}
      <div className="flex flex-wrap gap-2 text-sm">
        {TABS.map(([value, label]) => (
          <Link key={label} href={value ? `/ideas?status=${value}` : "/ideas?status="} className={`rounded-full px-3 py-1 ${status === value ? "bg-accent text-white" : "bg-surface2 text-muted hover:text-white"}`}>
            {label}
          </Link>
        ))}
      </div>
      {topics.length === 0 ? (
        <p className="card text-sm text-muted">Nothing here.</p>
      ) : (
        <ul className="space-y-3">
          {topics.map((t) => (
            <li key={t.topic_id} className="card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/ideas/${t.topic_id}`} className="min-w-0 font-medium hover:text-accent">{t.topic}</Link>
                <Badge status={t.status} />
              </div>
              <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted">{t.notes_for_ai}</p>
              <p className="text-xs text-muted">{t.topic_id} · {t.channel} · priority {t.priority} · {t.source === "research" ? "from research" : "added by hand"}</p>
              {t.status === "failed" && t.failure_reason && <p className="text-xs text-red-300">{t.failure_reason}</p>}
              <IdeaActions t={t} isAdmin={me.role === "admin"} compact />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
