"use client";

import { useState } from "react";

/**
 * The backend hands out a fresh signed video URL on every page render. The publish panel refreshes the page
 * every few seconds while posting, so using the live URL would reload the <video> each time. Keep the first one.
 */
export function ReelVideo({ src, poster }: { src: string; poster?: string }) {
  const [first] = useState({ src, poster });
  return (
    <video
      className="aspect-[9/16] w-full max-w-72 rounded-xl border border-line bg-black object-contain"
      src={first.src}
      poster={first.poster}
      controls
      playsInline
      preload="metadata"
    />
  );
}
