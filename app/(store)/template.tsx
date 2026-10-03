"use client";

import { m } from "motion/react";

export default function StoreTemplate({ children }: { children: React.ReactNode }) {
  return <m.div initial={{ opacity: 1 }} animate={{ opacity: [0.8, 1] }} transition={{ duration: 0.25 }}>{children}</m.div>;
}
