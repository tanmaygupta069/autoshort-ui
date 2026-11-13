import { ChannelFilter } from "@/components/ChannelFilter";
import { getJson } from "@/lib/server/api";
import { selectedChannel } from "@/lib/server/channel";
import type { Channel } from "@/lib/types";

/** Page title on the left, channel filter on the right, on one row. */
export async function PageHead({ title, searchParams }: { title: string; searchParams: Record<string, string | string[] | undefined> }) {
  const live = (await getJson<Channel[]>("/channels")).filter((c) => c.status === "active");
  const saved = await selectedChannel(searchParams);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1>{title}</h1>
      <ChannelFilter channels={live} cookieValue={live.some((c) => c.id === saved) ? saved : ""} />
    </div>
  );
}
