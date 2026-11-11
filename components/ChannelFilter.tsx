"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Channel } from "@/lib/types";

const FILTERED = ["/", "/reels", "/ideas"]; // the list pages; everything else is across channels

export function ChannelFilter({ channels, cookieValue }: { channels: Channel[]; cookieValue: string }) {
  const path = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  if (!FILTERED.includes(path) || channels.length < 1) return null;

  const q = params.get("channel");
  const selected = q !== null ? (channels.some((c) => c.id === q) ? q : "") : cookieValue;

  function change(value: string) {
    try {
      document.cookie = `as_channel=${value}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      /* the URL still carries the choice */
    }
    const next = new URLSearchParams(params.toString());
    next.set("channel", value || "*");
    router.push(`${path}?${next.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-xs text-muted">
      <span className="hidden sm:inline">Channel</span>
      <select aria-label="Filter by channel" className="input !w-auto !py-1.5" value={selected} onChange={(e) => change(e.target.value)}>
        <option value="">All channels</option>
        {channels.map((c) => <option key={c.id} value={c.id}>{c.display_name || c.id}</option>)}
      </select>
    </label>
  );
}
