import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/firebase-admin";
import { requireApiAdmin, verifyOrigin } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";
import { ValidationError } from "@/lib/validation";
import { mediaAssets } from "@/lib/media-server";

export async function DELETE(request: Request) {
  try {
    verifyOrigin(request); await requireApiAdmin();
    const { path } = await readJson(request);
    if (typeof path !== "string" || !/^(hero|site|products\/[\w-]+)\/[^/]+$/.test(path) || path.includes("..")) throw new ValidationError("Invalid media path.");
    const { db, bucket } = getAdmin();
    const productId = path.startsWith("products/") ? path.split("/")[1] : null;
    const documents = productId ? [await db.doc(`products/${productId}`).get()] : (await db.collection("site").get()).docs;
    if (documents.some(doc => mediaAssets(doc.data()).some(media => media.path === path))) throw new ValidationError("This file is in use. Remove or replace it in its product or site section first.");
    await bucket.file(path).delete({ ignoreNotFound: true });
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
