import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { DecisionForm } from "@/components/DecisionForm";
import { NoteForm } from "@/components/NoteForm";
import { PublishPanel } from "@/components/PublishPanel";
import { backend, getJson } from "@/lib/server/api";
import { when } from "@/lib/format";
import type { Connection, Me, Publication, TopicDetail } from "@/lib/types";

export default async function ReelPage({ params }: PageProps<"/reels/[topic]/[draft]">) {
  const { topic, draft } = await params;
  const [res, mediaRes] = await Promise.all([
    backend(`/topics/${encodeURIComponent(topic)}`),
    backend(`/drafts/${encodeURIComponent(topic)}/${encodeURIComponent(draft)}/media`).catch(() => null),
  ]);
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("could not load this reel");
  const t = (await res.json()) as TopicDetail;
  const media: { video_url: string | null; thumb_url: string | null } =
    mediaRes && mediaRes.ok ? await mediaRes.json() : { video_url: null, thumb_url: null };
  const d = t.drafts.find((x) => String(x.draft) === draft);
  if (!d) notFound();
  const notes = t.notes;
  const publishable = d.status === "approved" || d.status === "published";
  const [me, connections, publications] = publishable
    ? await Promise.all([
        getJson<Me>("/me"),
        getJson<Connection[]>(`/channels/${encodeURIComponent(t.channel)}/connections`).catch(() => [] as Connection[]), // reviewers may not list accounts
        getJson<Publication[]>(`/drafts/${encodeURIComponent(topic)}/${encodeURIComponent(draft)}/publications`),
      ])
    : [null, [] as Connection[], [] as Publication[]];
  return (
    <div className="space-y-6">
      <Link href="/reels" className="text-sm text-muted hover:text-white">← Reels</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">{d.yt_title || t.topic}</h1>
        <Badge status={d.status} />
      </div>
      <p className="text-sm text-muted">{t.topic_id} · draft {d.draft} of {t.drafts.length} · {d.duration_s ? `${d.duration_s}s · ` : ""}updated {when(d.updated_at)}</p>

      <div className="grid gap-6 md:grid-cols-[18rem_1fr]">
        {media.video_url ? (
          <video
            key={media.video_url}
            className="aspect-[9/16] w-full max-w-72 rounded-xl border border-line bg-black object-contain"
            src={media.video_url}
            poster={media.thumb_url ?? undefined}
            controls
            playsInline
            preload="metadata"
          />
        ) : (
          <div className="card flex aspect-[9/16] w-full max-w-72 items-center justify-center text-center text-sm text-muted">
            No stored video for this draft yet.
            <br />
            File: {d.video_file || "none"}
          </div>
        )}
        <div className="space-y-4">
          <section className="card space-y-3">
            <div>
              <div className="label">YouTube Shorts</div>
              <p className="font-medium">{d.yt_title}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{d.yt_description}</p>
              <p className="mt-1 text-sm text-accent">{d.yt_hashtags}</p>
            </div>
            <div>
              <div className="label">Instagram caption</div>
              <p className="whitespace-pre-wrap text-sm">{d.ig_caption}</p>
              <p className="mt-1 text-sm text-accent">{d.ig_hashtags}</p>
            </div>
            {d.qa_result && (
              <div>
                <div className="label">Automatic checks</div>
                <p className="text-sm text-muted">{d.qa_result}</p>
              </div>
            )}
          </section>
          {d.status === "ready_for_review" && <DecisionForm topicId={t.topic_id} draft={d.draft} />}
          {publishable && me && (
            <PublishPanel topicId={t.topic_id} draftNo={d.draft} channelId={t.channel} isAdmin={me.role === "admin"} connections={connections} publications={publications} />
          )}
          {d.feedback && d.status !== "ready_for_review" && (
            <div className="card text-sm"><div className="label">Feedback given</div>{d.feedback}</div>
          )}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Notes</h2>
        {notes.length === 0 ? <p className="text-sm text-muted">No notes yet.</p> : (
          <ul className="space-y-2">
            {notes.map((n) => (
              <li key={n.id} className="card text-sm">
                <div className="text-xs text-muted">{n.author ?? "Telegram"} · {when(n.created_at)} · {n.kind.replace("_", " ")}</div>
                <p className="mt-1 whitespace-pre-wrap">{n.body}</p>
              </li>
            ))}
          </ul>
        )}
        <NoteForm topicId={t.topic_id} draftNo={d.draft} />
      </section>
    </div>
  );
}
