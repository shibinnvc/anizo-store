"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import type { SiteSettings } from "@/types/site";
import { getProductOptions } from "@/lib/product-options";
import { formatPrice } from "@/lib/utils";
import { BuyButton } from "./buy-button";
import { Price, DiscountBadge } from "./price";

export function ProductPurchase({ product, settings, initialVariantId }: { product: Product; settings: SiteSettings; initialVariantId?: string }) {
  const options = getProductOptions(product);
  const [selectedId, setSelectedId] = useState(() => options.find(option => option.id === initialVariantId)?.id || options.find(option => option.inStock)?.id || "default");
  const [quantity, setQuantity] = useState(1);
  const selected = options.find(option => option.id === selectedId) || options[0];
  const pricedProduct = { ...product, ...selected };

  function select(id: string) {
    setSelectedId(id);
    const url = new URL(window.location.href);
    if (id === "default") url.searchParams.delete("variant"); else url.searchParams.set("variant", id);
    window.history.replaceState(window.history.state, "", url);
  }

  return <div className="purchase-block">
    {options.length > 1 ? <fieldset className="product-options"><legend>Size / format</legend><div className="product-option-list">{options.map(option => <label key={option.id} className={`product-option ${selected.id === option.id ? "is-selected" : ""}`}><input type="radio" name={`size-${product.id}`} value={option.id} checked={selected.id === option.id} onChange={() => select(option.id)} /><span>{option.size}<small>{formatPrice(option.discountedPrice, product.currency)}{!option.inStock && " · Sold out"}</small></span></label>)}</div></fieldset> : <div className="product-size">{selected.size}</div>}
    <div className="detail-price" aria-live="polite" aria-atomic="true"><Price product={pricedProduct} large /><DiscountBadge product={pricedProduct} /></div>
    <p className={`product-availability ${selected.inStock ? "available" : ""}`} role="status">{selected.inStock ? "Available to order" : "This size is currently sold out"}{selected.sku && <span>SKU: {selected.sku}</span>}</p>
    <div className="quantity-row"><span className="eyebrow">QUANTITY</span><div className="quantity-control"><button aria-label="Decrease quantity" disabled={!selected.inStock || quantity === 1} onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button><output aria-live="polite">{quantity}</output><button aria-label="Increase quantity" disabled={!selected.inStock || quantity === 99} onClick={() => setQuantity(q => Math.min(99, q + 1))}>+</button></div></div>
    <BuyButton product={product} option={selected} settings={settings} quantity={quantity} />
    <p className="purchase-note">A personal conversation, from first hello to your doorstep.<br />Your order message opens in WhatsApp, ready for you to send.</p>
  </div>;
}
