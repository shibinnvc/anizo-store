"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaAsset } from "@/types/product";

export function ProductVideo({ video, poster }: { video: MediaAsset; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  if (failed) return <p className="muted">This film is temporarily unavailable.</p>;
  return <video ref={ref} src={visible ? video.url : undefined} poster={poster} preload="none" muted playsInline controls className="product-video" aria-label="Product film" onError={() => setFailed(true)} />;
}
