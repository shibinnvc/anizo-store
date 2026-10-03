"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, ProductInput } from "@/types/product";
import { errorMessage, slugify } from "@/lib/utils";
import { adminFetch } from "@/lib/client-api";
import { UploadField } from "./upload-field";
import { ProductPricingFields } from "./product-pricing-fields";
import { ProductProfileFields } from "./product-profile-fields";
import { useFeedback } from "./feedback";
import { useUnsavedChanges } from "./unsaved-changes";

const emptyProduct: ProductInput = {
  name: "", slug: "", shortDescription: "", fullDescription: "", images: [], video: null,
  originalPrice: 0, discountType: "none", discountValue: 0, currency: "INR",
  fragranceNotes: { top: [], heart: [], base: [] }, size: "", featured: false, active: false,
  inStock: true, sku: "", variants: [], concentration: "", gender: "", scentProfile: [],
  longevity: "", projection: "", ingredients: "", howToUse: "", shippingAndReturns: "",
};

export function ProductForm({ id, product }: { id: string; product?: Product }) {
  const [form, setForm] = useState<ProductInput>({ ...emptyProduct, ...product });
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [error, setError] = useState("");
  const [slugEdited, setSlugEdited] = useState(Boolean(product));
  const router = useRouter();
  const notify = useFeedback();
  useUnsavedChanges(dirty || uploads > 0);
  const change = (patch: Partial<ProductInput>) => { setForm(previous => ({ ...previous, ...patch })); setDirty(true); };
  const uploadBusy = (value: boolean) => setUploads(count => count + (value ? 1 : -1));

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (uploads > 0) return;
    setBusy(true); setError("");
    try {
      const result = await adminFetch(`/api/admin/products/${id}`, "PUT", { ...form, expectedUpdatedAt: product?.updatedAt || "" });
      setDirty(false); notify(result.warning || "Product saved.", result.warning ? "info" : "success");
      router.push("/admin/products"); router.refresh();
    } catch (error) { setError(errorMessage(error)); setBusy(false); }
  }

  return <form onSubmit={save} className="admin-form">
    <div className="admin-page-heading"><div><span className="eyebrow">PRODUCTS / {product ? "EDIT" : "NEW FRAGRANCE"}</span><h1>{product ? `Edit ${product.name}` : "A new signature."}</h1><p>{product ? "Refine your product and save to update the website." : "Add the details that make this fragrance yours."}</p></div><div className="heading-actions"><Link href="/admin/products" className="button button-outline">Cancel</Link><button className="button button-dark" disabled={busy || uploads > 0}>{busy ? "Saving…" : uploads > 0 ? "Uploading…" : "Save product"}</button></div></div>
    {error && <p role="alert" className="form-error form-error-banner">{error}</p>}
    <fieldset disabled={busy} className="form-layout">
      <div className="form-main">
        <section className="admin-panel"><h2>Product details</h2>
          <label className="field"><span>Product name</span><input required maxLength={120} value={form.name} onChange={e => change({ name: e.target.value, ...(!slugEdited ? { slug: slugify(e.target.value) } : {}) })} placeholder="Your fragrance name" /></label>
          <label className="field"><span>URL slug</span><div className="input-prefix"><span>/products/</span><input required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={100} value={form.slug} onChange={e => { setSlugEdited(true); change({ slug: e.target.value }); }} /></div><small>Keep this stable after publishing so existing links continue to work.</small></label>
          <label className="field"><span>Short description</span><textarea required maxLength={300} rows={2} value={form.shortDescription} onChange={e => change({ shortDescription: e.target.value })} placeholder="A short introduction for the collection page" /></label>
          <label className="field"><span>Full description</span><textarea required maxLength={10000} rows={6} value={form.fullDescription} onChange={e => change({ fullDescription: e.target.value })} placeholder="Tell the story of this fragrance" /></label>
        </section>
        <section className="admin-panel"><h2>Product imagery</h2><p className="panel-description">The first image is the cover. Publishing requires at least one image. Give each image a useful description for accessibility.</p>
          <UploadField label="Product images" value={form.images} onChange={images => change({ images })} folder={`products/${id}`} multiple onBusyChange={uploadBusy} />
          <UploadField label="Optional product film" value={form.video ? [form.video] : []} onChange={assets => change({ video: assets[0] || null })} folder={`products/${id}`} kind="video" onBusyChange={uploadBusy} />
        </section>
        <section className="admin-panel"><h2>Additional sizes & formats</h2><p className="panel-description">Set the primary size and price in the side panel. Add other sizes, perfume oils, or combinations here. Each option has its own price and availability.</p>
          {form.variants.map((variant, index) => <fieldset className="variant-editor" key={variant.id}><legend>Option {index + 2}</legend>
            <ProductPricingFields value={variant} currency={form.currency} onChange={patch => change({ variants: form.variants.map(item => item.id === variant.id ? { ...item, ...patch } : item) })} />
            <button type="button" className="text-link" onClick={() => change({ variants: form.variants.filter(item => item.id !== variant.id) })}>Remove option {index + 2}</button>
          </fieldset>)}
          <button type="button" className="button button-outline" disabled={form.variants.length >= 11} onClick={() => change({ variants: [...form.variants, { id: crypto.randomUUID(), size: "", originalPrice: 0, discountType: "none", discountValue: 0, inStock: true, sku: "" }] })}>Add size / format</button>
        </section>
        <ProductProfileFields form={form} onChange={change} />
      </div>
      <aside className="form-aside">
        <section className="admin-panel"><h2>Publication</h2><label className="switch-row"><span><strong>Active product</strong><small>Visible on the public website</small></span><input type="checkbox" checked={form.active} onChange={e => change({ active: e.target.checked })} /></label><label className="switch-row"><span><strong>Featured fragrance</strong><small>Prioritize on the homepage</small></span><input type="checkbox" checked={form.featured} onChange={e => change({ featured: e.target.checked })} /></label></section>
        <section className="admin-panel"><h2>Primary size & price</h2><label className="field"><span>Currency (all sizes)</span><select aria-label="Currency (all sizes)" value={form.currency} onChange={e => change({ currency: e.target.value })}>{["INR", "USD", "EUR", "GBP", "AED", "SAR"].map(currency => <option key={currency}>{currency}</option>)}</select></label><ProductPricingFields value={form} currency={form.currency} onChange={change} /></section>
        <p className="field-hint">Customers choose a size before ordering through WhatsApp. Configure your business number in Website settings.</p>
      </aside>
    </fieldset>
    <div className="form-save-bar"><span>{dirty ? "You have unsaved changes" : "All changes saved"}</span><button className="button button-dark" disabled={busy || uploads > 0}>{busy ? "Saving…" : "Save product"}</button></div>
  </form>;
}
