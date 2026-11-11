import "server-only";
import { cookies } from "next/headers";

export const CHANNEL_COOKIE = "as_channel";
const VALID = /^[a-z0-9][a-z0-9-]{0,60}$/;

/** The channel the lists are filtered to: `?channel=` in the URL wins, then the cookie. "" means all channels. */
export async function selectedChannel(sp: Record<string, string | string[] | undefined>): Promise<string> {
  const q = sp.channel;
  if (typeof q === "string") return VALID.test(q) ? q : ""; // "*" (or anything odd) = all channels
  const c = (await cookies()).get(CHANNEL_COOKIE)?.value ?? "";
  return VALID.test(c) ? c : "";
}

export function withChannel(path: string, channel: string): string {
  if (!channel) return path;
  return `${path}${path.includes("?") ? "&" : "?"}channel=${encodeURIComponent(channel)}`;
}
