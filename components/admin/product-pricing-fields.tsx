"use client";

import type { ProductVariantInput } from "@/types/product";
import { calculatePrice, formatPrice } from "@/lib/utils";

type Pricing = Omit<ProductVariantInput, "id">;

export function ProductPricingFields({ value, currency, onChange }: { value: Pricing; currency: string; onChange: (patch: Partial<Pricing>) => void }) {
  let price = "Check your price and discount";
  try { price = formatPrice(calculatePrice(value.originalPrice, value.discountType, value.discountValue), currency); } catch { /* Validation appears on save. */ }
  return <>
    <label className="field"><span>Size / format</span><input required maxLength={80} value={value.size} onChange={e => onChange({ size: e.target.value })} placeholder="e.g. 50 ml extrait de parfum" /></label>
    <label className="field"><span>SKU (optional)</span><input maxLength={100} value={value.sku} onChange={e => onChange({ sku: e.target.value })} placeholder="Your internal product code" /></label>
    <label className="field"><span>Original price</span><input required type="number" min={0} max={10000000} step="0.01" value={Number.isNaN(value.originalPrice) ? "" : value.originalPrice} onChange={e => onChange({ originalPrice: e.target.valueAsNumber })} /></label>
    <label className="field"><span>Discount</span><select aria-label="Discount" value={value.discountType} onChange={e => onChange({ discountType: e.target.value as Pricing["discountType"], discountValue: 0 })}><option value="none">No discount</option><option value="percentage">Percentage (%)</option><option value="fixed">Fixed amount</option></select></label>
    {value.discountType !== "none" && <label className="field"><span>{value.discountType === "percentage" ? "Discount percentage" : "Discount amount"}</span><input required type="number" min={0} max={value.discountType === "percentage" ? 100 : value.originalPrice} step="0.01" value={Number.isNaN(value.discountValue) ? "" : value.discountValue} onChange={e => onChange({ discountValue: e.target.valueAsNumber })} /></label>}
    <label className="switch-row"><span><strong>Available to order</strong><small>Turn off to show this size as sold out</small></span><input type="checkbox" checked={value.inStock} onChange={e => onChange({ inStock: e.target.checked })} /></label>
    <div className="price-preview"><span>Customer pays</span><strong>{price}</strong></div>
  </>;
}
