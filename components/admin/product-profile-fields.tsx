"use client";

import type { ProductInput } from "@/types/product";

export function ProductProfileFields({ form, onChange }: { form: ProductInput; onChange: (patch: Partial<ProductInput>) => void }) {
  return <>
    <section className="admin-panel"><h2>Fragrance profile</h2><p className="panel-description">Add the details you want customers to see. Empty optional fields stay hidden on the product page.</p>
      <label className="field"><span>Fragrance type / concentration (optional)</span><input maxLength={100} value={form.concentration} onChange={e => onChange({ concentration: e.target.value })} placeholder="e.g. Extrait de parfum, Eau de parfum, Perfume oil" /></label>
      <label className="field"><span>Gender (optional)</span><select aria-label="Gender (optional)" value={form.gender} onChange={e => onChange({ gender: e.target.value as ProductInput["gender"] })}><option value="">Not specified</option><option value="unisex">Unisex</option><option value="women">Women</option><option value="men">Men</option></select></label>
      <label className="field"><span>Scent profile / main accords (optional)</span><input defaultValue={form.scentProfile.join(", ")} maxLength={1200} onChange={e => onChange({ scentProfile: e.target.value.split(",").map(value => value.trim()).filter(Boolean) })} placeholder="e.g. Fresh, Floral, Sweet, Amber" /><small>Separate accords with commas.</small></label>
      <label className="field"><span>Longevity / lasting (optional)</span><input maxLength={150} value={form.longevity} onChange={e => onChange({ longevity: e.target.value })} placeholder="Enter the confirmed lasting time" /></label>
      <label className="field"><span>Projection (optional)</span><input maxLength={150} value={form.projection} onChange={e => onChange({ projection: e.target.value })} placeholder="Enter the confirmed projection or duration" /></label>
    </section>
    <section className="admin-panel"><h2>Fragrance composition</h2><p className="panel-description">Enter confirmed notes, separated by commas. Leave a layer empty if it does not apply.</p>
      {(["top", "heart", "base"] as const).map(layer => <label key={layer} className="field"><span className="capitalize">{layer} notes (optional)</span><input defaultValue={form.fragranceNotes[layer].join(", ")} maxLength={1200} placeholder="Separate notes with commas" onChange={e => onChange({ fragranceNotes: { ...form.fragranceNotes, [layer]: e.target.value.split(",").map(note => note.trim()).filter(Boolean) } })} /></label>)}
      <label className="field"><span>Ingredients (optional)</span><textarea maxLength={3000} rows={4} value={form.ingredients} onChange={e => onChange({ ingredients: e.target.value })} placeholder="Ingredient list from your product packaging" /></label>
    </section>
    <section className="admin-panel"><h2>Use & delivery</h2>
      <label className="field"><span>How to use (optional)</span><textarea maxLength={2000} rows={4} value={form.howToUse} onChange={e => onChange({ howToUse: e.target.value })} placeholder="Application instructions and care information" /></label>
      <label className="field"><span>Shipping & returns (optional)</span><textarea maxLength={3000} rows={4} value={form.shippingAndReturns} onChange={e => onChange({ shippingAndReturns: e.target.value })} placeholder="Delivery times, shipping charges, and your returns policy" /></label>
    </section>
  </>;
}
