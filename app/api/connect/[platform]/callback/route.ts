import { NextResponse } from "next/server";
import { backend } from "@/lib/server/api";

// Google / Facebook send the person back here after they sign in. The backend checks the one-time state against the
// signed-in session, swaps the code for tokens, and stores them encrypted; the browser never sees a token.
export async function GET(req: Request, ctx: RouteContext<"/api/connect/[platform]/callback">) {
  const { platform } = await ctx.params;
  const url = new URL(req.url);
  const to = (path: string) => NextResponse.redirect(new URL(path, url));
  if (platform !== "youtube" && platform !== "instagram") return new NextResponse("not found", { status: 404 });

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const denied = url.searchParams.get("error_description") || url.searchParams.get("error");
  if (denied || !code || !state) return to(`/admin/channels?connect_error=${encodeURIComponent(denied || "the sign-in was cancelled")}`);

  const res = await backend("/connections/callback", { method: "POST", body: JSON.stringify({ platform, code, state }), headers: { "content-type": "application/json" } });
  if (res.status === 401) return to("/login");
  const data = (await res.json().catch(() => ({}))) as { channel_id?: string; detail?: string };
  if (!res.ok || !data.channel_id) return to(`/admin/channels?connect_error=${encodeURIComponent(data.detail || "could not connect the account")}`);
  return to(`/admin/channels/${encodeURIComponent(data.channel_id)}?connected=${platform}`);
}
