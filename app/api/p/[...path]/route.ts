import { NextResponse } from "next/server";
import { backend } from "@/lib/server/api";
import { sameOrigin } from "@/lib/server/origin";

// Only these backend areas are reachable from the browser through this proxy.
const ALLOWED = ["topics", "drafts", "users", "waitlist", "channels", "summary", "auth/sessions", "me"];

async function forward(req: Request, ctx: RouteContext<"/api/p/[...path]">) {
  const { path } = await ctx.params;
  const target = path.join("/");
  if (!ALLOWED.some((p) => target === p || target.startsWith(p + "/"))) {
    return NextResponse.json({ detail: "not found" }, { status: 404 });
  }
  const mutating = req.method !== "GET";
  if (mutating && !sameOrigin(req)) return NextResponse.json({ detail: "bad origin" }, { status: 403 });
  const url = new URL(req.url);
  const res = await backend(`/${target}${url.search}`, {
    method: req.method,
    body: mutating ? await req.text() : undefined,
    headers: mutating ? { "content-type": "application/json" } : undefined,
  });
  return new NextResponse(await res.text(), { status: res.status, headers: { "content-type": "application/json" } });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
