"use client";

import type { StylePack } from "@/lib/types";

export function StyleCards({ styles, value, onChange, disabled }: { styles: StylePack[]; value: string; onChange: (id: string) => void; disabled?: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Animation style">
      {styles.map((s) => {
        const on = s.id === value;
        return (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={disabled}
            onClick={() => onChange(s.id)}
            className={`card text-left transition disabled:opacity-60 ${on ? "border-accent ring-1 ring-accent" : "hover:border-muted"}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{s.label}</span>
              {on && <span className="text-xs text-accent">selected</span>}
            </div>
            <p className="mt-1 text-xs text-muted">{s.description}</p>
          </button>
        );
      })}
    </div>
  );
}
