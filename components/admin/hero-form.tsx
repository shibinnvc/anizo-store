"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { HeroSettings } from "@/types/site";
import { UploadField } from "./upload-field";
import { useFeedback } from "./feedback";
import { useUnsavedChanges } from "./unsaved-changes";
import { adminFetch } from "@/lib/client-api";
import { errorMessage } from "@/lib/utils";

export function HeroForm({ hero }: { hero: HeroSettings }) {
  const [form, setForm] = useState(hero);
  const [busy, setBusy] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const notify = useFeedback();
  const router = useRouter();
  useUnsavedChanges(dirty || uploads > 0);
  const update = <K extends keyof HeroSettings>(key: K, value: HeroSettings[K]) => { setForm(previous => ({ ...previous, [key]: value })); setDirty(true); };
  const uploadBusy = (value: boolean) => setUploads(count => count + (value ? 1 : -1));
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (uploads) return; setBusy(true); setError("");
    try { const result = await adminFetch<{ updatedAt: string; warning?: string }>("/api/admin/site/hero", "PUT", { ...form, expectedUpdatedAt: form.updatedAt }); setForm(previous => ({ ...previous, updatedAt: result.updatedAt })); setDirty(false); notify(result.warning || "Your hero is live.", result.warning ? "info" : "success"); router.refresh(); }
    catch (error) { setError(errorMessage(error)); } finally { setBusy(false); }
  }
  return <form onSubmit={save} className="admin-form"><div className="admin-page-heading"><div><span className="eyebrow">THE FIRST IMPRESSION</span><h1>Hero management.</h1><p>Set the film, imagery and words that introduce your brand.</p></div><button className="button button-dark" disabled={busy || uploads > 0}>{busy ? "Saving…" : uploads ? "Uploading…" : "Save hero"}</button></div>{error && <p role="alert" className="form-error form-error-banner">{error}</p>}<fieldset disabled={busy} className="form-layout"><div className="form-main"><section className="admin-panel"><h2>Campaign media</h2><label className="switch-row"><span><strong>Enable hero video</strong><small>The poster is always shown first</small></span><input type="checkbox" checked={form.enabled} onChange={e => update("enabled", e.target.checked)} /></label><UploadField label="Desktop hero video" value={form.video ? [form.video] : []} onChange={assets => update("video", assets[0] || null)} folder="hero" kind="video" onBusyChange={uploadBusy} /><UploadField label="Mobile hero video (optional)" value={form.mobileVideo ? [form.mobileVideo] : []} onChange={assets => update("mobileVideo", assets[0] || null)} folder="hero" kind="video" onBusyChange={uploadBusy} /><UploadField label="Poster image (required)" value={form.poster ? [form.poster] : []} onChange={assets => { if (assets[0]) update("poster", assets[0]); }} folder="hero" onBusyChange={uploadBusy} /></section><section className="admin-panel"><h2>Hero copy</h2><label className="field"><span>Eyebrow</span><input required maxLength={100} value={form.eyebrow} onChange={e => update("eyebrow", e.target.value)} /></label><label className="field"><span>Heading</span><textarea required maxLength={150} rows={2} value={form.heading} onChange={e => update("heading", e.target.value)} /><small>Use a line break to shape your headline.</small></label><label className="field"><span>Subtitle</span><textarea required maxLength={400} rows={3} value={form.subtitle} onChange={e => update("subtitle", e.target.value)} /></label><div className="form-row"><label className="field"><span>CTA text</span><input required maxLength={80} value={form.ctaText} onChange={e => update("ctaText", e.target.value)} /></label><label className="field"><span>CTA destination</span><input required maxLength={1000} value={form.ctaUrl} onChange={e => update("ctaUrl", e.target.value)} placeholder="/#collection" /></label></div></section></div><aside className="form-aside"><section className="admin-panel"><h2>Poster preview</h2><div className="admin-hero-preview"><Image src={form.poster.url} alt={form.poster.alt} fill sizes="320px" className="object-cover" /><div><span>{form.eyebrow}</span><h3 className="preserve-lines">{form.heading}</h3><p>{form.ctaText} ↗</p></div></div><p className="field-hint">The live hero adapts its crop to the visitor’s screen.</p></section><section className="admin-panel"><h2>Keep it cinematic. Keep it light.</h2><p className="panel-description">Use a short, silent H.264 MP4 with web streaming enabled. Aim for under 5 MB on desktop and under 2 MB on mobile. Storage hosts your file as uploaded; it does not compress or transcode it.</p><p className="panel-description">A portrait mobile film keeps your subject in frame. Visitors with reduced motion or data saving receive the poster and can choose to play the film.</p></section></aside></fieldset><div className="form-save-bar"><span>{dirty ? "You have unsaved changes" : "All changes saved"}</span><button className="button button-dark" disabled={busy || uploads > 0}>{busy ? "Saving…" : "Save hero"}</button></div></form>;
}
