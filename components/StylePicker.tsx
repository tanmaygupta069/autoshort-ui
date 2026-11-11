"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StyleCards } from "@/components/StyleCards";
import { call } from "@/lib/client";
import type { Channel, StylePack } from "@/lib/types";

export function StylePicker({ channel, styles }: { channel: Channel; styles: StylePack[] }) {
  const router = useRouter();
  const [value, setValue] = useState(channel.style_pack);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const custom = !styles.some((s) => s.id === channel.style_pack);

  async function save() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await call(`channels/${channel.id}/style`, "PUT", { style_pack: value });
      setMsg(channel.status === "active" ? "Saved. Reels made from now on use this style; existing reels are not redrawn." : "Saved.");
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (custom) {
    return <section className="card text-sm text-muted">This channel has a custom look ({channel.style_pack}) that is built in and cannot be switched here.</section>;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">Animation style</h2>
      <StyleCards styles={styles} value={value} onChange={setValue} disabled={busy} />
      <div className="flex items-center gap-3">
        <button className="btn-primary" disabled={busy || value === channel.style_pack} onClick={save}>{busy ? "Saving..." : "Save style"}</button>
        {msg && <span className="text-sm text-emerald-300" role="status">{msg}</span>}
        {err && <span className="text-sm text-red-300" role="alert">{err}</span>}
      </div>
    </section>
  );
}
