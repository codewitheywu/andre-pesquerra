"use client";

import { LazyMotion, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import type { ReactNode } from "react";
import { useHydrated } from "@/hooks/useHydrated";
import { EASE_OUT, REVEAL } from "@/lib/motion";

const loadFeatures = () =>
  import("@/lib/motionFeatures").then((module) => module.default);

type RevealProps = {
  children: ReactNode;
  index?: number;
};

/**
 * Fade and lift content into view once. Only use below the fold.
 * Until hydration, `data-reveal` lets CSS un-hide the content if JS is
 * disabled or fails to load (see globals.css), so nothing stays blank.
 */
export default function Reveal({ children, index = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();

  return (
    <LazyMotion features={loadFeatures} strict>
      <m.div
        data-reveal={hydrated ? "hydrated" : "pending"}
        initial={{ opacity: 0, y: reduceMotion ? 0 : REVEAL.distance }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{
          duration: REVEAL.duration,
          ease: EASE_OUT,
          delay: index * REVEAL.stagger,
        }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
