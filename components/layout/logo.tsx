import Image from "next/image";
import type { MediaAsset } from "@/types/product";

export function Logo({ light = false, className = "", asset, brandName = "ANIZO" }: { light?: boolean; className?: string; asset?: MediaAsset | null; brandName?: string }) {
  return <Image src={asset?.url || `/brand/logo-${light ? "light" : "dark"}.svg`} alt={brandName} width={1080} height={330} className={`brand-logo ${className}`} unoptimized={!asset} />;
}
