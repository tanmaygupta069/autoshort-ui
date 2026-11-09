import { STATUS_LABEL, STATUS_TONE } from "@/lib/format";

export function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_TONE[status] ?? "bg-zinc-500/20 text-zinc-300"}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
