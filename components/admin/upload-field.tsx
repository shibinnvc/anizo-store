"use client";

import Image from "next/image";
import { useId, useState } from "react";
import type { MediaAsset } from "@/types/product";
import { uploadMedia, validateUpload, IMAGE_TYPES, VIDEO_TYPES } from "@/lib/storage";
import { errorMessage } from "@/lib/utils";
import { useFeedback } from "./feedback";

export function UploadField({ label, value, onChange, folder, kind = "image", multiple = false, onBusyChange }: { label: string; value: MediaAsset[]; onChange: (assets: MediaAsset[]) => void; folder: string; kind?: "image" | "video"; multiple?: boolean; onBusyChange?: (busy: boolean) => void }) {
  const id = useId();
  const notify = useFeedback();
  const [progress, setProgress] = useState<number | null>(null);
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const selected = Array.from(files);
    setError("");
    try {
      if (multiple && value.length + selected.length > 12) throw new Error("A product can have at most 12 images.");
      selected.forEach(file => validateUpload(file, kind));
      setProgress(0); onBusyChange?.(true);
      const uploaded: MediaAsset[] = [];
      for (const file of selected) {
        setFilename(file.name);
        const asset = await uploadMedia(file, folder, kind, setProgress);
        uploaded.push(asset);
        onChange(multiple ? [...value, ...uploaded] : [asset]);
      }
      notify("Upload complete. Save this page to publish your changes.");
    } catch (error) { setError(errorMessage(error)); }
    finally { setProgress(null); onBusyChange?.(false); }
  }
  return <div className="upload-field"><span className="field-label">{label}</span>{value.length > 0 && <div className={`upload-previews ${kind === "video" ? "video-previews" : ""}`}>{value.map((asset, index) => <div className="upload-preview" key={asset.url}>{kind === "image" ? <div className="upload-image"><Image src={asset.url} alt={asset.alt || "Uploaded image"} fill sizes="180px" className="object-cover" /></div> : <video src={asset.url} controls playsInline preload="none" aria-label={label} />}<div className="upload-caption"><span title={asset.name}>{asset.name}</span><button type="button" disabled={progress !== null} onClick={() => onChange(value.filter((_, i) => index !== i))} aria-label={`Remove ${asset.name}`}>Remove</button></div>{kind === "image" && <label className="field compact"><span>Image description</span><input value={asset.alt} maxLength={300} required onChange={event => onChange(value.map((item, i) => i === index ? { ...item, alt: event.target.value } : item))} /></label>}{multiple && value.length > 1 && <div className="image-order"><button type="button" disabled={index === 0 || progress !== null} onClick={() => { const reordered = [...value]; [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]]; onChange(reordered); }}>Move earlier</button><span>{index === 0 ? "Cover image" : `Image ${index + 1}`}</span></div>}</div>)}</div>}<label htmlFor={id} className={`upload-zone ${progress !== null ? "is-uploading" : ""}`}><span className="upload-plus">↑</span><span>{progress !== null ? `Uploading ${filename}` : `Choose ${multiple ? "images" : kind === "video" ? "a video" : "an image"}`}</span><small>{kind === "image" ? "JPG, PNG, WebP or AVIF · up to 10 MB each" : "MP4 or WebM · up to 60 MB · web-optimized recommended"}</small><input id={id} type="file" accept={(kind === "image" ? IMAGE_TYPES : VIDEO_TYPES).join(",")} multiple={multiple} disabled={progress !== null} onChange={event => { void upload(event.target.files); event.target.value = ""; }} /></label>{progress !== null && <div className="upload-progress"><progress max={100} value={progress} aria-label={`Uploading ${filename}`} /><span>{progress}%</span></div>}{error && <p role="alert" className="form-error">{error}</p>}<p className="field-hint">Changes take effect when you save. Replaced files are cleaned up after saving.</p></div>;
}
