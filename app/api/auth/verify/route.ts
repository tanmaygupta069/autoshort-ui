import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backend, SESSION_COOKIE } from "@/lib/server/api";
import { sameOrigin } from "@/lib/server/origin";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ detail: "bad origin" }, { status: 403 });
  const res = await backend("/auth/verify", {
    method: "POST",
    body: await req.text(),
    headers: { "content-type": "application/json", "user-agent": req.headers.get("user-agent") ?? "" },
  });
  const data = await res.json().catch(() => ({ detail: "unexpected response" }));
  if (!res.ok) return NextResponse.json({ detail: data.detail ?? "sign-in failed" }, { status: res.status });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: data.expires_in,
  });
  return NextResponse.json({ user: data.user });
}
