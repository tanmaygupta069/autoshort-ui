import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { IdeaActions } from "@/components/IdeaActions";
import { NoteForm } from "@/components/NoteForm";
import { backend, getJson } from "@/lib/server/api";
import { when } from "@/lib/format";
import type { Me, TopicDetail } from "@/lib/types";

function describe(e: TopicDetail["events"][number]): string {
  const who = e.actor ?? e.actor_kind;
  if (e.from_status || e.to_status) return `${who}: ${e.type.replaceAll("_", " ")} (${e.from_status ?? "-"} → ${e.to_status ?? "-"})`;
  return `${who}: ${e.type.replaceAll("_", " ")}`;
}

export default async function IdeaPage({ params }: PageProps<"/ideas/[id]">) {
  const { id } = await params;
  const me = await getJson<Me>("/me");
  const res = await backend(`/topics/${encodeURIComponent(id)}`);
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("could not load this idea");
  const t = (await res.json()) as TopicDetail;
  return (
    <div className="space-y-6">
      <Link href="/ideas" className="text-sm text-muted hover:text-white">← Ideas</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">{t.topic}</h1>
        <Badge status={t.status} />
      </div>
      <p className="text-sm text-muted">{t.topic_id} · {t.channel} · priority {t.priority} · {t.source === "research" ? "from research" : "added by hand"}</p>
      <section className="card space-y-1">
        <div className="label">Brief for the producer</div>
        <p className="whitespace-pre-wrap text-sm">{t.notes_for_ai || "No brief."}</p>
      </section>
      {t.failure_reason && <p className="card border-red-500/40 text-sm text-red-300">{t.failure_reason}</p>}
      <IdeaActions t={t} isAdmin={me.role === "admin"} />

      {t.drafts.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold">Drafts</h2>
          <ul className="space-y-2">
            {t.drafts.map((d) => (
              <li key={d.draft}>
                <Link href={`/reels/${t.topic_id}/${d.draft}`} className="card flex items-center justify-between hover:border-accent">
                  <span>Draft {d.draft}: {d.yt_title}</span>
                  <Badge status={d.status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Notes</h2>
        {t.notes.length === 0 ? <p className="text-sm text-muted">No notes yet.</p> : (
          <ul className="space-y-2">
            {t.notes.map((n) => (
              <li key={n.id} className="card text-sm">
                <div className="text-xs text-muted">{n.author ?? "Telegram"} · {when(n.created_at)}</div>
                <p className="mt-1 whitespace-pre-wrap">{n.body}</p>
              </li>
            ))}
          </ul>
        )}
        <NoteForm topicId={t.topic_id} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">History</h2>
        <ul className="space-y-1 text-sm text-muted">
          {t.events.map((e) => <li key={e.id}>{when(e.at)} · {describe(e)}</li>)}
        </ul>
      </section>
    </div>
  );
}
