"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/client";
import { ago } from "@/lib/format";
import type { Role, WaitlistRow } from "@/lib/types";

export function WaitlistAdmin({ rows }: { rows: WaitlistRow[] }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>("reviewer");
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");

  async function run(id: string, fn: () => Promise<unknown>, done: string) {
    setBusy(id);
    setErr("");
    setNote("");
    try {
      await fn();
      setNote(done);
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy("");
    }
  }

  const waiting = rows.filter((r) => r.status === "waiting");
  const decided = rows.filter((r) => r.status !== "waiting");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <label className="label !mb-0" htmlFor="wr">Invite as</label>
        <select id="wr" className="input w-auto" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="reviewer">Reviewer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {err && <p className="text-sm text-red-300" role="alert">{err}</p>}
      {note && <p className="text-sm text-emerald-300" role="status">{note}</p>}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Waiting ({waiting.length})</h2>
        {waiting.length === 0 && <p className="text-sm text-muted">Nobody is waiting.</p>}
        {waiting.map((r) => (
          <div key={r.id} className="card flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate font-medium">{r.email}</div>
              {r.niche && <div className="text-sm text-muted">wants to make: {r.niche}</div>}
              <div className="text-xs text-muted">
                first tried {ago(r.first_at)} · {r.requests} {r.requests === 1 ? "attempt" : "attempts"} · {r.notified_at ? "told they are on the list" : "not emailed yet"}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary" disabled={busy === r.id} onClick={() => run(r.id, async () => {
                const res = await call<{ mailed: boolean }>(`waitlist/${r.id}/invite`, "POST", { role });
                if (!res.mailed) throw new Error(`${r.email} was invited, but the invite email did not send. Tell them to sign in.`);
              }, `${r.email} invited`)}>Invite</button>
              <button className="btn-ghost" disabled={busy === r.id} onClick={() => run(r.id, () => call(`waitlist/${r.id}/dismiss`, "POST", {}), `${r.email} dismissed`)}>Dismiss</button>
            </div>
          </div>
        ))}
      </section>

      {decided.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted">Decided</h2>
          {decided.map((r) => (
            <div key={r.id} className="card flex items-center justify-between gap-3 text-sm opacity-70">
              <span className="truncate">{r.email}</span>
              <span className="text-xs text-muted">{r.status} {ago(r.decided_at)}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
