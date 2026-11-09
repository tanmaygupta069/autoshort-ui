"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/client";

export function DecisionForm({ topicId, draft }: { topicId: string; draft: number }) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "revision" | "reject">("idle");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function decide(action: "approve" | "revision" | "reject") {
    setBusy(true);
    setErr("");
    try {
      await call(`drafts/${topicId}/${draft}/decision`, "POST", { action, feedback: text });
      router.push("/reels");
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="card space-y-3">
      <h2 className="text-sm font-semibold">Your decision</h2>
      {mode === "idle" ? (
        <div className="flex flex-wrap gap-2">
          <button className="btn-ok" disabled={busy} onClick={() => decide("approve")}>Approve</button>
          <button className="btn-ghost" onClick={() => setMode("revision")}>Request changes</button>
          <button className="btn-danger" onClick={() => setMode("reject")}>Reject</button>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="label" htmlFor="fb">{mode === "revision" ? "What should change? (required)" : "Why reject? (optional)"}</label>
          <textarea id="fb" className="input min-h-28" value={text} onChange={(e) => setText(e.target.value)} autoFocus placeholder={mode === "revision" ? "e.g. shorten the intro, the knob label is wrong..." : ""} />
          <div className="flex gap-2">
            <button className={mode === "revision" ? "btn-primary" : "btn-danger"} disabled={busy || (mode === "revision" && !text.trim())} onClick={() => decide(mode)}>
              {mode === "revision" ? "Send for revision" : "Reject reel"}
            </button>
            <button className="btn-ghost" onClick={() => { setMode("idle"); setText(""); }}>Cancel</button>
          </div>
        </div>
      )}
      {err && <p className="text-sm text-red-300" role="alert">{err}</p>}
    </div>
  );
}
