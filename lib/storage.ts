import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { getFirebase } from "./firebase";
import type { MediaAsset } from "@/types/product";

export const IMAGE_LIMIT = 10 * 1024 * 1024;
export const VIDEO_LIMIT = 60 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const VIDEO_TYPES = ["video/mp4", "video/webm"];

export function validateUpload(file: File, kind: "image" | "video") {
  const allowed = kind === "image" ? IMAGE_TYPES : VIDEO_TYPES;
  const limit = kind === "image" ? IMAGE_LIMIT : VIDEO_LIMIT;
  if (!allowed.includes(file.type)) throw new Error(`Choose ${kind === "image" ? "a JPG, PNG, WebP or AVIF image" : "an MP4 or WebM video"}.`);
  if (file.size === 0 || file.size > limit) throw new Error(`File must be between 1 byte and ${limit / 1024 / 1024} MB.`);
}

export async function uploadMedia(file: File, folder: string, kind: "image" | "video", onProgress: (percent: number) => void): Promise<MediaAsset> {
  validateUpload(file, kind);
  const { auth, storage } = getFirebase();
  await auth.authStateReady();
  const token = await auth.currentUser?.getIdTokenResult(true);
  if (token?.claims.admin !== true) throw new Error("Sign in with your admin account before uploading.");
  const basename = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/\.{2,}/g, "-").slice(-100);
  const path = `${folder}/${crypto.randomUUID()}-${basename}`;
  const task = uploadBytesResumable(ref(storage, path), file, { contentType: file.type, cacheControl: "public,max-age=31536000,immutable" });
  await new Promise<void>((resolve, reject) => task.on("state_changed", snapshot => onProgress(Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100)), reject, resolve));
  return { url: await getDownloadURL(task.snapshot.ref), path, name: file.name.slice(0, 200), contentType: file.type, size: file.size, alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") };
}
