"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import type { Product, ProductVariant } from "@/types/product";
import type { SiteSettings } from "@/types/site";
import { createWhatsAppOrderUrl } from "@/lib/whatsapp";
import { siteUrl } from "@/lib/utils";
import { getProductOptions, productOptionPath } from "@/lib/product-options";
import { Arrow, WhatsAppIcon } from "@/components/ui/icons";

// An origin is stable for the lifetime of a document, so it needs no listener.
const subscribeToOrigin = () => () => {};
const getBrowserOrigin = () => window.location.origin;

export function BuyButton({ product, settings, compact = false, quantity = 1, option }: { product: Product; settings: SiteSettings; compact?: boolean; quantity?: number; option?: ProductVariant }) {
  const origin = useSyncExternalStore(subscribeToOrigin, getBrowserOrigin, siteUrl);
  const options = getProductOptions(product);
  const selected = option || options[0];
  if (compact && options.length > 1) return <Link href={`/products/${product.slug}`} className="text-link">Choose size<Arrow diagonal width={15} height={15} /></Link>;
  if (!selected.inStock) return <span className={compact ? "order-unavailable" : "button button-disabled"} aria-disabled="true">Sold out</span>;
  let href: string | null = null;
  if (settings.whatsappNumber) {
    try { href = createWhatsAppOrderUrl({ phone: settings.whatsappNumber, productName: product.name, size: selected.size, price: selected.discountedPrice, currency: product.currency, quantity, productUrl: `${origin}${productOptionPath(product.slug, selected.id)}`, defaultMessage: settings.whatsappDefaultMessage }); } catch { /* Invalid settings must never create an unsafe order link. */ }
  }
  if (!href) return <span className={compact ? "order-unavailable" : "button button-disabled"} aria-disabled="true">Ordering opens soon</span>;
  return <a href={href} target="_blank" rel="noopener noreferrer" className={compact ? "text-link" : "button button-dark buy-button"} aria-label={`Buy ${product.name} on WhatsApp`}>{!compact && <WhatsAppIcon />}Buy now{compact ? <Arrow diagonal width={15} height={15} /> : <Arrow />}</a>;
}
