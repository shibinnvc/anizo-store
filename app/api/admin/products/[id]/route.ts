import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/firebase-admin";
import { requireApiAdmin, verifyOrigin } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";
import { parseProduct, ValidationError } from "@/lib/validation";
import { calculatePrice } from "@/lib/utils";
import { hasProductDiscount } from "@/lib/product-options";
import { cleanupReplacedMedia } from "@/lib/media-server";

type Context = { params: Promise<{ id: string }> };
async function context(request: Request, params: Context["params"]) {
  verifyOrigin(request); await requireApiAdmin();
  const { id } = await params;
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id)) throw new ValidationError("Invalid product ID.");
  return { id, ...getAdmin() };
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const { id, db } = await context(request, params);
    const body = await readJson(request);
    const input = parseProduct(body, id);
    const doc = db.doc(`products/${id}`);
    const now = new Date().toISOString();
    const before = await db.runTransaction(async transaction => {
      const existing = await transaction.get(doc);
      if (existing.exists && body.expectedUpdatedAt !== existing.data()?.updatedAt) throw new ValidationError("This product was changed in another session. Reload before saving.");
      const slugRef = db.doc(`productSlugs/${input.slug}`);
      const slug = await transaction.get(slugRef);
      if (slug.exists && slug.data()?.productId !== id) throw new ValidationError("This slug belongs to another product. Choose a unique slug.");
      const previous = existing.data();
      if (previous?.slug && previous.slug !== input.slug) transaction.delete(db.doc(`productSlugs/${previous.slug}`));
      transaction.set(slugRef, { productId: id });
      transaction.set(doc, { ...input, hasDiscount: hasProductDiscount(input), variants: input.variants.map(variant => ({ ...variant, discountedPrice: calculatePrice(variant.originalPrice, variant.discountType, variant.discountValue) })), discountedPrice: calculatePrice(input.originalPrice, input.discountType, input.discountValue), createdAt: previous?.createdAt || now, updatedAt: now });
      return previous;
    });
    const warning = await cleanupReplacedMedia(before, input);
    return NextResponse.json({ success: true, warning });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const { id, db } = await context(request, params);
    const body = await readJson(request);
    const before = await db.runTransaction(async transaction => {
      const doc = db.doc(`products/${id}`);
      const existing = await transaction.get(doc);
      if (!existing.exists) throw new ValidationError("Product no longer exists.");
      const data = existing.data()!;
      if (body.expectedUpdatedAt !== data.updatedAt) throw new ValidationError("This product has changed. Reload before deleting.");
      transaction.delete(doc);
      transaction.delete(db.doc(`productSlugs/${data.slug}`));
      return data;
    });
    const warning = await cleanupReplacedMedia(before, null);
    return NextResponse.json({ success: true, warning });
  } catch (error) { return apiError(error); }
}
