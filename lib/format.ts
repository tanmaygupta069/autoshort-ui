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
  proposed: "bg-amber-500/15 text-amber-300",
  queued: "bg-sky-500/15 text-sky-300",
  in_progress: "bg-violet-500/15 text-violet-300",
  ready_for_review: "bg-amber-500/15 text-amber-300",
  revision_requested: "bg-orange-500/15 text-orange-300",
  approved: "bg-emerald-500/15 text-emerald-300",
  published: "bg-emerald-500/15 text-emerald-300",
  failed: "bg-red-500/15 text-red-300",
  rejected: "bg-zinc-500/20 text-zinc-300",
  superseded: "bg-zinc-500/20 text-zinc-400",
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
