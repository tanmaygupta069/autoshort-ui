import Link from "next/link";
import { Badge } from "@/components/Badge";
import { getJson } from "@/lib/server/api";
import { ago } from "@/lib/format";
import type { Draft } from "@/lib/types";

const TABS = [
  ["ready_for_review", "To review"],
  ["revision_requested", "Revision requested"],
  ["approved", "Approved"],
  ["rejected", "Rejected"],
  ["", "All"],
] as const;

export default async function Reels({ searchParams }: PageProps<"/reels">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "ready_for_review";
  const drafts = await getJson<Draft[]>(`/drafts${status ? `?status=${encodeURIComponent(status)}` : ""}`);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Reels</h1>
      <div className="flex flex-wrap gap-2 text-sm">
        {TABS.map(([value, label]) => (
          <Link key={label} href={value ? `/reels?status=${value}` : "/reels?status="} className={`rounded-full px-3 py-1 ${status === value ? "bg-accent text-white" : "bg-surface2 text-muted hover:text-white"}`}>
            {label}
          </Link>
        ))}
      </div>
      {drafts.length === 0 ? (
        <p className="card text-sm text-muted">Nothing here.</p>
      ) : (
        <ul className="space-y-2">
          {drafts.map((d) => (
            <li key={`${d.topic_id}-${d.draft}`}>
              <Link href={`/reels/${d.topic_id}/${d.draft}`} className="card flex items-center justify-between gap-3 hover:border-accent">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{d.yt_title || d.topic_id}</span>
                  <span className="text-xs text-muted">{d.topic_id} · draft {d.draft} · {d.duration_s ? `${d.duration_s}s · ` : ""}{ago(d.updated_at)}</span>
                </span>
                <Badge status={d.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
