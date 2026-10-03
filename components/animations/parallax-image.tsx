"use client";

import { useRef } from "react";
import Image from "next/image";
import { m, useScroll, useTransform, useReducedMotion } from "motion/react";
import type { MediaAsset } from "@/types/product";

export function ParallaxImage({ asset, className = "", sizes = "100vw" }: { asset: MediaAsset; className?: string; sizes?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);
  return <div ref={ref} className={`parallax-image ${className}`}><m.div className="parallax-image-inner" style={{ y: reduced ? 0 : y }}><Image src={asset.url} alt={asset.alt} fill sizes={sizes} className="object-cover" /></m.div></div>;
}
