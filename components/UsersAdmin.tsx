"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/client";
import { ago } from "@/lib/format";
import type { Role, UserRow } from "@/lib/types";

export function UsersAdmin({ users, meId }: { users: UserRow[]; meId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("reviewer");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setErr("");
    try {
      await fn();
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        className="card grid gap-3 sm:grid-cols-[1fr_1fr_9rem_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => {
            await call("users", "POST", { email, name, role });
            setEmail("");
            setName("");
          });
        }}
      >
        <div>
          <label className="label" htmlFor="ue">Email to invite</label>
          <input id="ue" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="un">Name (optional)</label>
          <input id="un" className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="ur">Role</label>
          <select id="ur" className="input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="reviewer">Reviewer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button className="btn-primary" disabled={busy}>Invite</button>
      </form>
      {err && <p className="text-sm text-red-300" role="alert">{err}</p>}
      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u.id} className={`card flex flex-wrap items-center justify-between gap-3 ${u.active ? "" : "opacity-60"}`}>
            <div className="min-w-0">
              <div className="truncate font-medium">{u.name || u.email}{u.id === meId && <span className="ml-2 text-xs text-muted">(you)</span>}</div>
              <div className="text-xs text-muted">{u.email} · last sign-in {ago(u.last_login_at)}</div>
            </div>
            <div className="flex items-center gap-2">
              <select
                aria-label={`Role of ${u.email}`}
                className="input w-auto"
                value={u.role}
                disabled={busy}
                onChange={(e) => run(() => call(`users/${u.id}`, "PATCH", { role: e.target.value }))}
              >
                <option value="reviewer">Reviewer</option>
                <option value="admin">Admin</option>
              </select>
              <button className={u.active ? "btn-danger" : "btn-ghost"} disabled={busy} onClick={() => run(() => call(`users/${u.id}`, "PATCH", { active: !u.active }))}>
                {u.active ? "Disable" : "Enable"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
