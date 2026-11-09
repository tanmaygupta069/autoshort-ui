import { ChannelSettings, SessionsList } from "@/components/SettingsPanels";
import { getJson } from "@/lib/server/api";
import type { Channel, Me, SessionRow } from "@/lib/types";

export default async function Settings() {
  const me = await getJson<Me>("/me");
  const [sessions, channels] = await Promise.all([
    getJson<SessionRow[]>("/auth/sessions"),
    me.role === "admin" ? getJson<Channel[]>("/channels") : Promise.resolve([] as Channel[]),
  ]);
  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Settings</h1>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Your devices</h2>
        <SessionsList sessions={sessions} />
      </section>
      {me.role === "admin" && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Channels</h2>
          {channels.map((c) => <ChannelSettings key={c.id} channel={c} />)}
        </section>
      )}
    </div>
  );
}
