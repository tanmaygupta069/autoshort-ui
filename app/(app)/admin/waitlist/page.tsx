import { redirect } from "next/navigation";
import { WaitlistAdmin } from "@/components/WaitlistAdmin";
import { getJson } from "@/lib/server/api";
import type { Me, WaitlistRow } from "@/lib/types";

export default async function WaitlistPage() {
  const me = await getJson<Me>("/me");
  if (me.role !== "admin") redirect("/");
  const rows = await getJson<WaitlistRow[]>("/waitlist");
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Waitlist</h1>
      <p className="text-sm text-muted">People who tried to sign in without an invite. They were emailed once to say they are on the list. Inviting creates their account and emails them.</p>
      <WaitlistAdmin rows={rows} />
    </div>
  );
}
