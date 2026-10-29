"use client";

import { ReactLenis } from "lenis/react";
import { SCROLL } from "@/lib/motion";

// Lenis honors prefers-reduced-motion by default (respectReducedMotion),
// and `anchors` routes in-page hash links through the smooth scroll.
export default function SmoothScroll() {
  return <ReactLenis root options={{ lerp: SCROLL.lerp, anchors: true }} />;
}
