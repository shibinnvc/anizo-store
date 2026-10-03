import "server-only";
import { getAdmin } from "./firebase-admin";
import type { MediaAsset } from "@/types/product";

export function mediaAssets(value: unknown): MediaAsset[] {
  if (!value || typeof value !== "object") return [];
  if ("path" in value && "url" in value && typeof value.path === "string") return [value as MediaAsset];
  return Object.values(value).flatMap(mediaAssets);
}

export async function cleanupReplacedMedia(before: unknown, after: unknown): Promise<string | undefined> {
  const retained = new Set(mediaAssets(after).map(item => item.path));
  const removed = [...new Set(mediaAssets(before).map(item => item.path).filter(path => path && !retained.has(path)))];
  if (!removed.length) return;
  const { bucket } = getAdmin();
  const results = await Promise.allSettled(removed.map(path => bucket.file(path).delete({ ignoreNotFound: true })));
  if (results.some(result => result.status === "rejected")) return "Saved successfully. Some replaced files could not be removed; use Media library to retry cleanup.";
}
