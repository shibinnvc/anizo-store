import { randomUUID } from "node:crypto";
import { access, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { scriptFirebase } from "./firebase.mjs";
import { defaultHero, defaultSettings } from "../lib/defaults";
import type { MediaAsset } from "../types/product";

const { db, bucket } = scriptFirebase();
const localMedia = process.argv.includes("--local-media");
const migrateLocalMedia = process.argv.includes("--migrate-local-media");

async function upload(asset: MediaAsset, folder: string): Promise<MediaAsset> {
  const source = resolve("public", asset.url.slice(1));
  await access(source);
  const info = await stat(source);
  const path = `${folder}/${randomUUID()}-${asset.name}`;
  const token = randomUUID();
  await bucket.upload(source, { destination: path, metadata: { contentType: asset.contentType, cacheControl: "public,max-age=31536000,immutable", metadata: { firebaseStorageDownloadTokens: token } } });
  return { ...asset, path, size: info.size, url: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}` };
}

async function main() {
  if (migrateLocalMedia) {
    for (const section of ["settings", "hero"] as const) {
      const doc = db.doc(`site/${section}`);
      const snapshot = await doc.get();
      if (!snapshot.exists) throw new Error(`Cannot migrate missing site/${section}. Run the content seed first.`);
      const current = snapshot.data()!;
      const fields = section === "settings" ? ["logo", "storyImage", "campaignImage"] : ["poster", "video", "mobileVideo"];
      const uploaded: string[] = [];
      const patch: Record<string, MediaAsset | null | string> = {};
      try {
        for (const field of fields) {
          const asset = current[field] as MediaAsset | null | undefined;
          if (!asset || asset.path || !asset.url.startsWith("/media/")) continue;
          const result = await upload(asset, section === "hero" ? "hero" : "site");
          uploaded.push(result.path);
          patch[field] = result;
        }
        if (uploaded.length) {
          patch.updatedAt = new Date().toISOString();
          await doc.update(patch);
          console.log(`Moved ${uploaded.length} site/${section} media files to Firebase Storage.`);
        } else console.log(`Skipped site/${section}: media already uses Firebase Storage.`);
      } catch (error) {
        await Promise.allSettled(uploaded.map(path => bucket.file(path).delete({ ignoreNotFound: true })));
        throw error;
      }
    }
    return;
  }
  // Never overwrite existing content or invent products.
  for (const section of ["settings", "hero"] as const) {
    const doc = db.doc(`site/${section}`);
    if ((await doc.get()).exists) { console.log(`Skipped site/${section}: already exists.`); continue; }
    const uploaded: string[] = [];
    const saveAsset = async (asset: MediaAsset, folder: string) => { if (localMedia) return asset; const result = await upload(asset, folder); uploaded.push(result.path); return result; };
    try {
      const data = section === "settings" ? {
        ...defaultSettings,
        storyImage: await saveAsset(defaultSettings.storyImage, "site"),
        campaignImage: await saveAsset(defaultSettings.campaignImage, "site"),
      } : {
        ...defaultHero,
        poster: await saveAsset(defaultHero.poster, "hero"),
        video: defaultHero.video ? await saveAsset(defaultHero.video, "hero") : null,
        mobileVideo: defaultHero.mobileVideo ? await saveAsset(defaultHero.mobileVideo, "hero") : null,
      };
      await doc.create({ ...data, updatedAt: new Date().toISOString() });
      console.log(`Created site/${section} with supplied ANIZO media ${localMedia ? "served locally" : "in Storage"}.`);
    } catch (error) {
      await Promise.allSettled(uploaded.map(path => bucket.file(path).delete({ ignoreNotFound: true })));
      throw error;
    }
  }
  console.log("Brand content initialized. Add confirmed products in /admin; the business WhatsApp number is editable in Website settings.");
}

main().catch(error => { console.error(error instanceof Error ? error.message : "Content setup failed."); process.exitCode = 1; });
