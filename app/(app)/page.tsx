import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { Badge } from "@/components/Badge";
import { getJson } from "@/lib/server/api";
import { selectedChannel, withChannel } from "@/lib/server/channel";
import { ago } from "@/lib/format";
import type { Channel, Draft, Summary, Topic } from "@/lib/types";

export default async function Overview({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const channel = await selectedChannel(sp);
  const [summary, waiting, proposed, channels] = await Promise.all([
    getJson<Summary>(withChannel("/summary", channel)),
    getJson<Draft[]>(withChannel("/drafts?status=ready_for_review", channel)),
    getJson<Topic[]>(withChannel("/topics?status=proposed", channel)),
    getJson<Channel[]>("/channels"),
  ]);
  const scope = channel ? (channels.find((c) => c.id === channel)?.display_name || channel) : "All channels";
  const n = (s: string) => summary.topics[s] ?? 0;
  const tiles = [
    { label: "Reels to review", value: waiting.length, href: "/reels", hot: waiting.length > 0 },
    { label: "Ideas to approve", value: proposed.length, href: "/ideas?status=proposed", hot: proposed.length > 0 },
    { label: "Being made", value: n("in_progress") + n("revision_requested") + n("queued"), href: "/ideas?status=queued" },
    { label: "Failed", value: n("failed"), href: "/ideas?status=failed", bad: n("failed") > 0 },
  ];
  return (
    <div className="space-y-8">
      <PageHead title="Overview" searchParams={sp} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className={`card block transition hover:border-accent ${t.hot ? "border-amber/60" : ""} ${t.bad ? "border-red-500/50" : ""}`}>
            <div className="text-3xl font-semibold">{t.value}</div>
            <div className="mt-1 text-xs text-muted">{t.label}</div>
          </Link>
        ))}
      </div>
      <p className="text-sm text-muted">
        <span className="text-white">{scope}</span> · Started today: {summary.first_drafts_today} of {summary.daily_cap} · Last research: {ago(summary.last_research)}
      </p>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Waiting for your review</h2>
        {waiting.length === 0 ? (
          <p className="card text-sm text-muted">Nothing waiting.</p>
        ) : (
          <ul className="space-y-2">
            {waiting.map((d) => (
              <li key={`${d.topic_id}-${d.draft}`}>
                <Link href={`/reels/${d.topic_id}/${d.draft}`} className="card flex items-center justify-between gap-3 hover:border-accent">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{d.yt_title || d.topic_id}</span>
                    <span className="text-xs text-muted">{d.topic_id} · draft {d.draft} · {ago(d.updated_at)}</span>
                  </span>
                  <Badge status={d.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Research ideas waiting for approval</h2>
        {proposed.length === 0 ? (
          <p className="card text-sm text-muted">No new ideas. Research adds more when the queue runs low.</p>
        ) : (
          <ul className="space-y-2">
            {proposed.slice(0, 5).map((t) => (
              <li key={t.topic_id}>
                <Link href={`/ideas/${t.topic_id}`} className="card block hover:border-accent">
                  <span className="font-medium">{t.topic}</span>
                  <span className="mt-1 block truncate text-xs text-muted">{t.topic_id} · {t.notes_for_ai}</span>
                </Link>
              </li>
            ))}
            {proposed.length > 5 && <li><Link className="text-sm text-accent" href="/ideas?status=proposed">See all {proposed.length}</Link></li>}
          </ul>
        )}
      </section>
    </div>
  );
}
