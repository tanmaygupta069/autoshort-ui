import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChannelProfile } from "@/components/ChannelProfile";
import { StylePicker } from "@/components/StylePicker";
import { backend, getJson } from "@/lib/server/api";
import type { ChannelDetail, Me, StylePack } from "@/lib/types";

export default async function ChannelPage({ params }: PageProps<"/admin/channels/[id]">) {
  const { id } = await params;
  const me = await getJson<Me>("/me");
  if (me.role !== "admin") redirect("/");
  const [res, styles] = await Promise.all([backend(`/channels/${encodeURIComponent(id)}`), getJson<StylePack[]>("/style-packs")]);
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("could not load this channel");
  const ch = (await res.json()) as ChannelDetail;
  return (
    <div className="space-y-6">
      <Link href="/admin/channels" className="text-sm text-muted hover:text-white">← Channels</Link>
      <div>
        <h1 className="text-xl font-semibold">{ch.display_name || ch.id}</h1>
        <p className="text-sm text-muted">{ch.niche}{ch.audience ? ` · for ${ch.audience}` : ""}{ch.tone ? ` · ${ch.tone}` : ""}</p>
      </div>
      <StylePicker channel={ch} styles={styles} />
      <ChannelProfile channel={ch} profile={ch.profile} />
    </div>
  );
}
