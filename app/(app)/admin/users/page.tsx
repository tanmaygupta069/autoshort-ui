import { redirect } from "next/navigation";
import { UsersAdmin } from "@/components/UsersAdmin";
import { getJson } from "@/lib/server/api";
import type { Me, UserRow } from "@/lib/types";

export default async function UsersPage() {
  const me = await getJson<Me>("/me");
  if (me.role !== "admin") redirect("/");
  const users = await getJson<UserRow[]>("/users");
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Users</h1>
      <p className="text-sm text-muted">Only invited emails can sign in. Reviewers can approve ideas, review reels and leave notes. Admins can do everything, including this page.</p>
      <UsersAdmin users={users} meId={me.id} />
    </div>
  );
}
