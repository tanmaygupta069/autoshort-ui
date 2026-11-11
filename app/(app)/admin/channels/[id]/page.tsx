import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChannelProfile } from "@/components/ChannelProfile";
import { ConnectionsPanel } from "@/components/ConnectionsPanel";
import { StylePicker } from "@/components/StylePicker";
import { backend, getJson } from "@/lib/server/api";
import type { ChannelDetail, Connection, Me, PublishingStatus, StylePack } from "@/lib/types";

export default async function ChannelPage({ params, searchParams }: PageProps<"/admin/channels/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const me = await getJson<Me>("/me");
  if (me.role !== "admin") redirect("/");
  const [res, styles, connections, pubStatus] = await Promise.all([
    backend(`/channels/${encodeURIComponent(id)}`),
    getJson<StylePack[]>("/style-packs"),
    getJson<Connection[]>(`/channels/${encodeURIComponent(id)}/connections`),
    getJson<PublishingStatus>("/publishing/status"),
  ]);
  const connected = typeof sp.connected === "string" ? sp.connected : "";
  const connectError = typeof sp.connect_error === "string" ? sp.connect_error : "";
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
      {ch.status === "active" && (
        <ConnectionsPanel channelId={ch.id} connections={connections} status={pubStatus}
          notice={{ ok: connected ? `${connected === "youtube" ? "YouTube" : "Instagram"} connected.` : undefined, error: connectError || undefined }} />
      )}
      <ChannelProfile channel={ch} profile={ch.profile} />
    </div>
  );
}
