"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/types/site";
import { UploadField } from "./upload-field";
import { useFeedback } from "./feedback";
import { useUnsavedChanges } from "./unsaved-changes";
import { adminFetch } from "@/lib/client-api";
import { errorMessage } from "@/lib/utils";

type TextKey = { [K in keyof SiteSettings]: SiteSettings[K] extends string ? K : never }[keyof SiteSettings];

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [form, setForm] = useState(settings);
  const [busy, setBusy] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const notify = useFeedback();
  const router = useRouter();
  useUnsavedChanges(dirty || uploads > 0);
  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => { setForm(previous => ({ ...previous, [key]: value })); setDirty(true); };
  const uploadBusy = (value: boolean) => setUploads(count => count + (value ? 1 : -1));
  const field = (key: TextKey, label: string, max: number, rows = 0, required = true, hint = "") => <label key={key} className="field"><span>{label}</span>{rows ? <textarea required={required} rows={rows} maxLength={max} value={form[key]} onChange={e => update(key, e.target.value)} /> : <input required={required} maxLength={max} value={form[key]} onChange={e => update(key, e.target.value)} />}{hint && <small>{hint}</small>}</label>;
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (uploads) return; setBusy(true); setError("");
    try { const result = await adminFetch<{ updatedAt: string; warning?: string }>("/api/admin/site/settings", "PUT", { ...form, expectedUpdatedAt: form.updatedAt }); setForm(previous => ({ ...previous, updatedAt: result.updatedAt })); setDirty(false); notify(result.warning || "Website settings saved.", result.warning ? "info" : "success"); router.refresh(); }
    catch (error) { setError(errorMessage(error)); } finally { setBusy(false); }
  }
  return <form onSubmit={save} className="admin-form"><div className="admin-page-heading"><div><span className="eyebrow">MAKE IT YOURS</span><h1>Website settings.</h1><p>Your business details, editorial content and contact experience.</p></div><button className="button button-dark" disabled={busy || uploads > 0}>{busy ? "Saving…" : "Save settings"}</button></div>{error && <p role="alert" className="form-error form-error-banner">{error}</p>}<fieldset disabled={busy} className="settings-grid"><section className="admin-panel"><h2>Brand & contact</h2>{field("brandName", "Business name", 80)}{field("tagline", "Brand tagline", 150)}{field("contactEmail", "Contact email (optional)", 200, 0, false)}{field("instagramUrl", "Instagram profile URL (optional)", 300, 0, false)}<UploadField label="Custom logo (optional)" value={form.logo ? [form.logo] : []} onChange={assets => update("logo", assets[0] || null)} folder="site" onBusyChange={uploadBusy} /><p className="field-hint">Leave empty to use the supplied ANIZO wordmark. Uploaded logos appear as provided on both light and dark backgrounds.</p></section><section className="admin-panel"><h2>WhatsApp ordering</h2>{field("whatsappNumber", "Business WhatsApp number", 30, 0, false, "Include country code, e.g. +91 followed by your number. Leave empty to pause ordering.")}{field("whatsappDefaultMessage", "Order message introduction", 1000, 4, true, "Product name, size, final price, quantity and the product link are added automatically.")}{field("contactHeading", "Contact section heading", 150, 2)}{field("contactBody", "Contact section text", 1000, 3)}<div className="form-notice">Customers review and send the prepared message inside WhatsApp. No message is sent automatically.</div></section><section className="admin-panel"><h2>The collection</h2>{field("collectionHeading", "Collection heading", 150)}{field("collectionDescription", "Collection introduction", 800, 3)}<h2 className="panel-subheading">Search appearance</h2>{field("seoDescription", "Website description", 300, 3, true, "A concise description for search engines and shared links.")}</section><section className="admin-panel"><h2>Brand story</h2>{field("storyEyebrow", "Story eyebrow", 100)}{field("storyHeading", "Story heading", 150, 2)}{field("storyBody", "Your brand story", 3000, 6)}<UploadField label="Story image" value={[form.storyImage]} onChange={assets => { if (assets[0]) update("storyImage", assets[0]); }} folder="site" onBusyChange={uploadBusy} /></section><section className="admin-panel"><h2>The campaign</h2>{field("campaignHeading", "Campaign headline", 150, 2)}<UploadField label="Campaign image" value={[form.campaignImage]} onChange={assets => { if (assets[0]) update("campaignImage", assets[0]); }} folder="site" onBusyChange={uploadBusy} /></section><section className="admin-panel"><h2>Brand philosophy</h2>{field("philosophyHeading", "Philosophy heading", 150, 2)}{field("philosophyBody", "Philosophy text", 2000, 6)}<p className="field-hint">Use line breaks in headings for intentional editorial layouts. Preview the website after saving.</p></section></fieldset><div className="form-save-bar"><span>{dirty ? "You have unsaved changes" : "All changes saved"}</span><button className="button button-dark" disabled={busy || uploads > 0}>{busy ? "Saving…" : "Save settings"}</button></div></form>;
}
