"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function post(url: string, body: unknown) {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail ?? "something went wrong");
    return data;
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await post("/api/auth/request", { email });
      setStep("code");
      setMsg("Check your email. If you are invited it has a 6-digit code (valid for 10 minutes); if not, it tells you that you are on the waitlist.");
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await post("/api/auth/verify", { email, code });
      router.push("/");
      router.refresh();
    } catch (err) {
      setMsg((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        Auto<span className="text-accent">Short</span>
      </h1>
      <p className="mb-6 text-sm text-muted">AutoShort is invite-only for now. Enter your email: invited people get a sign-in code, everyone else joins the waitlist. No passwords.</p>
      {step === "email" ? (
        <form onSubmit={sendCode} className="card space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required autoFocus autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <button className="btn-primary w-full" disabled={busy}>{busy ? "Sending..." : "Email me a code"}</button>
        </form>
      ) : (
        <form onSubmit={verify} className="card space-y-4">
          <div>
            <label className="label" htmlFor="code">6-digit code</label>
            <input id="code" required autoFocus inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} className="input text-center text-xl tracking-[0.5em]" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
          </div>
          <button className="btn-primary w-full" disabled={busy || code.length !== 6}>{busy ? "Checking..." : "Sign in"}</button>
          <button type="button" className="w-full text-xs text-muted hover:text-white" onClick={() => { setStep("email"); setCode(""); setMsg(""); }}>Use a different email</button>
        </form>
      )}
      {msg && <p className="mt-4 text-sm text-muted" role="status">{msg}</p>}
    </div>
  );
}
