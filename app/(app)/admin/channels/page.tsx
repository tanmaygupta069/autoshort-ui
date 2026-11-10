import Link from "next/link";
import { redirect } from "next/navigation";
import { ChannelNew } from "@/components/ChannelNew";
import { getJson } from "@/lib/server/api";
import type { Channel, Me } from "@/lib/types";

const TONE: Record<string, string> = {
  generating: "bg-violet-500/15 text-violet-300",
  ready: "bg-amber-500/15 text-amber-300",
  active: "bg-emerald-500/15 text-emerald-300",
  failed: "bg-red-500/15 text-red-300",
};
const LABEL: Record<string, string> = { generating: "Drafting profile", ready: "Needs your review", active: "Live", failed: "Draft failed" };

export default async function ChannelsPage() {
  const me = await getJson<Me>("/me");
  if (me.role !== "admin") redirect("/");
  const channels = await getJson<Channel[]>("/channels");
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Channels</h1>
      </div>
      <ChannelNew />
      <ul className="space-y-2">
        {channels.map((c) => (
          <li key={c.id}>
            <Link href={`/admin/channels/${c.id}`} className="card flex flex-wrap items-center justify-between gap-3 hover:border-accent">
              <div className="min-w-0">
                <div className="truncate font-medium">{c.display_name || c.id}</div>
                <div className="truncate text-xs text-muted">{c.niche || "no niche set"} · {c.style_pack}</div>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs ${TONE[c.status] ?? ""}`}>{LABEL[c.status] ?? c.status}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
