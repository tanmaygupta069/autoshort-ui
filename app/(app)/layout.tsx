import { Nav } from "@/components/Nav";
import { getJson } from "@/lib/server/api";
import type { Me } from "@/lib/types";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const me = await getJson<Me>("/me");
  return (
    <>
      <Nav me={me} />
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </>
  );
}
