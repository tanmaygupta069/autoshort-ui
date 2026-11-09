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
  const links = [...LINKS, ...(me.role === "admin" ? [{ href: "/admin/users", label: "Users" }] : []), { href: "/settings", label: "Settings" }];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight">
          Auto<span className="text-accent">Short</span>
        </Link>
        <nav className="flex flex-1 gap-1 overflow-x-auto text-sm">
          {links.map((l) => {
            const on = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={`rounded-md px-3 py-1.5 ${on ? "bg-surface2 text-white" : "text-muted hover:text-white"}`}>
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="hidden sm:inline">{me.email} · {me.role}</span>
          <button onClick={logout} className="rounded-md border border-line px-2.5 py-1 hover:text-white">Sign out</button>
        </div>
      </div>
    </header>
  );
}
