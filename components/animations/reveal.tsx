"use client";

import { m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <m.div className={className} initial={{ opacity: 1, y: 0 }} whileInView={reduced ? {} : { y: [24, 0], opacity: [0.4, 1] }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.85, delay }}>{children}</m.div>;
}
