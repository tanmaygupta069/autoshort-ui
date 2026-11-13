export const STATUS_LABEL: Record<string, string> = {
  proposed: "Waiting for approval",
  queued: "Approved - queued",
  in_progress: "Being made",
  ready_for_review: "Ready to review",
  revision_requested: "Revision requested",
  approved: "Approved",
  published: "Published",
  failed: "Failed",
  rejected: "Rejected",
  superseded: "Superseded",
  done: "Done",
  revised: "Revised",
};

export const STATUS_TONE: Record<string, string> = {
  proposed: "bg-amber-500/30 text-amber-200",
  queued: "bg-sky-500/30 text-sky-200",
  in_progress: "bg-violet-500/30 text-violet-200",
  ready_for_review: "bg-amber-500/30 text-amber-200",
  revision_requested: "bg-orange-500/30 text-orange-200",
  approved: "bg-emerald-500/30 text-emerald-200",
  published: "bg-emerald-500/30 text-emerald-200",
  failed: "bg-red-500/30 text-red-200",
  rejected: "bg-zinc-500/30 text-zinc-200",
  superseded: "bg-zinc-500/30 text-zinc-200",
};

export function when(iso: string | null | undefined): string {
  if (!iso) return "never";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function ago(iso: string | null | undefined): string {
  if (!iso) return "never";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (!Number.isFinite(s)) return String(iso);
  if (s < 90) return "just now";
  if (s < 5400) return `${Math.round(s / 60)} min ago`;
  if (s < 129600) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
}
