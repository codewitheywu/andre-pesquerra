"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { SCROLL } from "@/lib/motion";

/**
 * A smooth scroll still running when the route changes would carry on in the
 * new page and override where it lands (e.g. /blog → /#contact ending up at
 * the old target). stop() drops the animation at the current position.
 */
function CancelOnRouteChange() {
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    if (!lenis) return;
    lenis.stop();
    lenis.start();
  }, [lenis, pathname]);

  return null;
}

// Lenis honors prefers-reduced-motion by default (respectReducedMotion),
// and `anchors` routes in-page hash links through the smooth scroll.
export default function SmoothScroll() {
  return (
    <ReactLenis root options={{ lerp: SCROLL.lerp, anchors: true }}>
      <CancelOnRouteChange />
    </ReactLenis>
  );
}
