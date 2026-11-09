import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backend, SESSION_COOKIE } from "@/lib/server/api";
import { sameOrigin } from "@/lib/server/origin";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ detail: "bad origin" }, { status: 403 });
  await backend("/auth/logout", { method: "POST" }).catch(() => undefined);
  (await cookies()).delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
