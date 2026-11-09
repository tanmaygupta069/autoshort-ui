import { NextResponse } from "next/server";
import { backend } from "@/lib/server/api";
import { sameOrigin } from "@/lib/server/origin";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ detail: "bad origin" }, { status: 403 });
  const body = await req.text();
  const res = await backend("/auth/request", { method: "POST", body, headers: { "content-type": "application/json" } });
  return new NextResponse(await res.text(), { status: res.status, headers: { "content-type": "application/json" } });
}
