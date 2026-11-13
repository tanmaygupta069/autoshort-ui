"use client";

import { useCallback, useRef, useState } from "react";

type Opts = { title: string; body: string; confirmLabel?: string; danger?: boolean };

/** Pixel-styled replacement for window.confirm. Render `dialog` once, then `await confirm({...})`. */
export function useConfirm() {
  const ref = useRef<HTMLDialogElement>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);
  const [opts, setOpts] = useState<Opts>({ title: "", body: "" });

  const confirm = useCallback((o: Opts) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      ref.current?.showModal();
    });
  }, []);

  function done(v: boolean) {
    resolver.current?.(v);
    resolver.current = null;
    ref.current?.close();
  }

  const dialog = (
    <dialog
      ref={ref}
      onCancel={(e) => { e.preventDefault(); done(false); }}
      onClick={(e) => { if (e.target === ref.current) done(false); }}
      className="m-auto w-[min(28rem,92vw)] border-2 border-black bg-surface p-0 text-white shadow-[8px_8px_0_#000] backdrop:bg-black/70"
    >
      <div className="space-y-4 p-5">
        <h2>{opts.title}</h2>
        <p className="text-sm text-muted">{opts.body}</p>
        <div className="flex justify-end gap-3">
          <button type="button" className="btn-ghost" onClick={() => done(false)}>Cancel</button>
          <button type="button" autoFocus className={opts.danger ? "btn-danger" : "btn-ok"} onClick={() => done(true)}>{opts.confirmLabel ?? "OK"}</button>
        </div>
      </div>
    </dialog>
  );

  return { confirm, dialog };
}
