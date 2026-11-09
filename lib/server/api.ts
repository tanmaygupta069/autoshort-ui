import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE = "as_session";

function base(): string {
  const url = process.env.API_BASE_URL;
  const secret = process.env.API_PROXY_SECRET;
  if (!url || !secret) throw new Error("API_BASE_URL and API_PROXY_SECRET must be set");
  return url.replace(/\/$/, "");
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** Call the backend as the signed-in user. Never reaches the browser: the secret and token stay on the server. */
export async function backend(path: string, init: RequestInit = {}, token?: string): Promise<Response> {
  const jar = await cookies();
  const t = token ?? jar.get(SESSION_COOKIE)?.value;
  const h = new Headers(init.headers);
  h.set("x-proxy-secret", process.env.API_PROXY_SECRET!);
  h.set("x-forwarded-for", await clientIp());
  if (t) h.set("authorization", `Bearer ${t}`);
  return fetch(`${base()}${path}`, { ...init, headers: h, cache: "no-store" });
}

/** GET JSON for server components; sends the user to /login when the session is gone. */
export async function getJson<T>(path: string): Promise<T> {
  const res = await backend(path);
  if (res.status === 401) redirect("/login");
  if (!res.ok) {
    const detail = await res.json().then((j) => j.detail).catch(() => res.statusText);
    throw new Error(`${path}: ${detail}`);
  }
  return res.json() as Promise<T>;
}
