"use client";

/** Call the backend through the Next.js proxy (cookie + secret are added server-side). Throws Error(detail) on failure. */
export async function call<T = unknown>(path: string, method: "GET" | "POST" | "PATCH" | "DELETE" = "POST", body?: unknown): Promise<T> {
  const res = await fetch(`/api/p/${path}`, {
    method,
    headers: body !== undefined ? { "content-type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("signed out");
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : "request failed");
  return data as T;
}
