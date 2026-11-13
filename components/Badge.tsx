import { STATUS_LABEL, STATUS_TONE } from "@/lib/format";

export function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-block whitespace-nowrap border-2 border-black px-2 py-0.5 font-mono text-base uppercase leading-none ${STATUS_TONE[status] ?? "bg-zinc-500/20 text-zinc-300"}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
