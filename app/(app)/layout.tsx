import { cookies } from "next/headers";
import { Nav } from "@/components/Nav";
import { CHANNEL_COOKIE } from "@/lib/server/channel";
import { getJson } from "@/lib/server/api";
import type { Channel, Me } from "@/lib/types";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const [me, channels, jar] = await Promise.all([getJson<Me>("/me"), getJson<Channel[]>("/channels"), cookies()]);
  const live = channels.filter((c) => c.status === "active");
  const saved = jar.get(CHANNEL_COOKIE)?.value ?? "";
  return (
    <>
      <Nav me={me} channels={live} channelCookie={live.some((c) => c.id === saved) ? saved : ""} />
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </>
  );
}
