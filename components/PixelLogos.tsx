export function PixelYouTube({ on = true, className = "size-14" }: { on?: boolean; className?: string }) {
  const red = on ? "#ff2d2d" : "#9a6a8a";
  return (
    <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges" aria-hidden="true">
      <rect x="2" y="4" width="12" height="8" fill={red} />
      <rect x="1" y="5" width="1" height="6" fill={red} /><rect x="14" y="5" width="1" height="6" fill={red} />
      <rect x="2" y="3" width="12" height="1" fill={red} opacity=".6" />
      <rect x="6" y="6" width="1" height="4" fill="#fff" /><rect x="7" y="6.5" width="1" height="3" fill="#fff" />
      <rect x="8" y="7" width="1" height="2" fill="#fff" /><rect x="9" y="7.5" width="1" height="1" fill="#fff" />
    </svg>
  );
}

export function PixelInstagram({ on = true, className = "size-14" }: { on?: boolean; className?: string }) {
  const a = on ? "#ff4fa3" : "#9a6a8a";
  const b = on ? "#ffb830" : "#9a6a8a";
  return (
    <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges" aria-hidden="true">
      <rect x="3" y="2" width="10" height="1" fill={b} /><rect x="3" y="13" width="10" height="1" fill={a} />
      <rect x="2" y="3" width="1" height="10" fill={b} /><rect x="13" y="3" width="1" height="10" fill={a} />
      <rect x="2" y="2" width="1" height="1" fill={b} opacity=".5" /><rect x="13" y="2" width="1" height="1" fill={a} opacity=".5" />
      <rect x="2" y="13" width="1" height="1" fill={a} opacity=".5" /><rect x="13" y="13" width="1" height="1" fill={a} opacity=".5" />
      <rect x="6" y="5" width="4" height="1" fill={a} /><rect x="6" y="10" width="4" height="1" fill={a} />
      <rect x="5" y="6" width="1" height="4" fill={a} /><rect x="10" y="6" width="1" height="4" fill={a} />
      <rect x="11" y="4" width="1" height="1" fill={b} />
    </svg>
  );
}
