import Link from "next/link";
import { PublishFromList } from "@/components/PublishFromList";
import { PageHead } from "@/components/PageHead";
import { Badge } from "@/components/Badge";
import { getJson } from "@/lib/server/api";
import { selectedChannel, withChannel } from "@/lib/server/channel";
import { ago } from "@/lib/format";
import type { Draft, Me, Summary } from "@/lib/types";

const TABS = [
  ["ready_for_review", "To review"],
  ["revision_requested", "Revision requested"],
  ["approved", "Ready to publish"],
  ["published", "Published"],
  ["rejected", "Rejected"],
  ["", "All"],
] as const;

export default async function Reels({ searchParams }: PageProps<"/reels">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "ready_for_review";
  const channel = await selectedChannel(sp);
  const [drafts, me, summary] = await Promise.all([
    getJson<Draft[]>(withChannel(`/drafts${status ? `?status=${encodeURIComponent(status)}` : ""}`, channel)),
    getJson<Me>("/me"),
    getJson<Summary>(withChannel("/summary", channel)),
  ]);
  const count = (v: string) => (v ? summary.drafts[v] ?? 0 : Object.values(summary.drafts).reduce((a, b) => a + b, 0));
  return (
    <div className="space-y-4">
      <PageHead title="Reels" searchParams={sp} />
      <div className="flex flex-wrap gap-2 text-sm">
        {TABS.map(([value, label]) => (
          <Link key={label} href={value ? `/reels?status=${value}` : "/reels?status="} className={`rounded-full px-3 py-1 ${status === value ? "bg-accent text-white" : "bg-surface2 text-muted hover:text-white"}`}>
            {label} <span className="font-mono">{count(value)}</span>
          </Link>
        ))}
      </div>
      {drafts.length === 0 ? (
        <p className="card text-sm text-muted">Nothing here.</p>
      ) : (
        <ul className="space-y-2">
          {drafts.map((d) => (
            <li key={`${d.topic_id}-${d.draft}`} className="card flex items-center justify-between gap-3 hover:border-accent">
              <Link href={`/reels/${d.topic_id}/${d.draft}`} className="min-w-0 flex-1">
                <span className="block truncate font-medium">{d.yt_title || d.topic_id}</span>
                <span className="text-xs text-muted">{!channel && `${d.channel} · `}{d.topic_id} · draft {d.draft} · {d.duration_s ? `${d.duration_s}s · ` : ""}{ago(d.updated_at)}</span>
              </Link>
              <Badge status={d.status} />
              {me.role === "admin" && (d.status === "approved" || d.status === "published") && (
                <PublishFromList topicId={d.topic_id} draftNo={d.draft} channelId={d.channel} published={d.status === "published"} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
