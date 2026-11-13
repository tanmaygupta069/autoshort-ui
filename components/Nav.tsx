"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Me } from "@/lib/types";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/reels", label: "Reels" },
  { href: "/ideas", label: "Ideas" },
];

export function Nav({ me }: { me: Me }) {
  const path = usePathname();
  const router = useRouter();
  const links = [...LINKS, ...(me.role === "admin" ? [{ href: "/admin/users", label: "Users" }, { href: "/admin/channels", label: "Channels" }, { href: "/admin/waitlist", label: "Waitlist" }] : []), { href: "/settings", label: "Settings" }];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="z-10 border-b-4 border-black bg-surface md:fixed md:inset-y-0 md:left-0 md:flex md:w-56 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r-4">
      <div className="flex flex-col gap-4 p-4 md:h-full">
        <Link href="/" className="font-display text-xs tracking-tight">
          Auto<span className="text-accent">Short</span>
        </Link>
        <nav className="flex gap-2 overflow-x-auto text-sm md:flex-col md:overflow-visible">
          {links.map((l) => {
            const on = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={`whitespace-nowrap px-3 py-2 uppercase ${on ? "bg-accent text-white shadow-[3px_3px_0_#000]" : "text-muted hover:text-white"}`}>
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="md:mt-auto flex flex-col gap-3 text-xs text-muted">
          <span className="hidden break-all md:inline">{me.email} · {me.role}</span>
          <button onClick={logout} className="border-2 border-black bg-surface2 px-2.5 py-1 uppercase shadow-[3px_3px_0_#000] hover:text-white active:translate-x-[3px] active:translate-y-[3px] active:shadow-none">Sign out</button>
        </div>
      </div>
    </aside>
  );
}
