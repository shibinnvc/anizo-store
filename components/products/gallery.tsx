"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { MediaAsset } from "@/types/product";

export function Gallery({ images, name }: { images: MediaAsset[]; name: string }) {
  const [active, setActive] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  return <div className="product-gallery">
    <div className="gallery-rail" ref={rail} onScroll={() => { if (rail.current) setActive(Math.round(rail.current.scrollLeft / rail.current.clientWidth)); }} tabIndex={0} aria-label={`${name} image gallery. Swipe or use the thumbnails to browse.`}>
      {images.map((item, index) => <div className="gallery-image" key={item.url}><Image src={item.url} alt={item.alt || `${name}, view ${index + 1}`} fill preload={index === 0} sizes="(max-width: 800px) 100vw, 55vw" className="object-cover" /></div>)}
    </div>
    {images.length > 1 && <div className="gallery-thumbnails" aria-label="Select product image">{images.map((item, index) => <button key={item.url} className={active === index ? "active" : ""} aria-label={`View image ${index + 1}`} aria-pressed={active === index} onClick={() => rail.current?.scrollTo({ left: index * rail.current.clientWidth, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })}><Image src={item.url} alt="" fill sizes="80px" className="object-cover" /></button>)}</div>}
  </div>;
}
