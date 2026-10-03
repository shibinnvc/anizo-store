import "server-only";
import { cache } from "react";
import { FieldPath, Timestamp, type DocumentData } from "firebase-admin/firestore";
import { getAdmin, isServerConfigured } from "./firebase-admin";
import { defaultHero, defaultSettings } from "./defaults";
import { calculatePrice } from "./utils";
import { hasProductDiscount } from "./product-options";
import type { Product, ProductPage } from "@/types/product";
import type { HeroSettings, SiteSettings } from "@/types/site";

export function serialize<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value, (_, v) => v instanceof Timestamp ? v.toDate().toISOString() : v)) as T;
}

export function productFromDocument(id: string, data: DocumentData): Product {
  const product = serialize<Product>(data);
  return {
    ...product, id, hasDiscount: hasProductDiscount(product),
    inStock: product.inStock ?? true, sku: product.sku || "", concentration: product.concentration || "", gender: product.gender || "", scentProfile: product.scentProfile || [],
    longevity: product.longevity || "", projection: product.projection || "", ingredients: product.ingredients || "", howToUse: product.howToUse || "", shippingAndReturns: product.shippingAndReturns || "",
    variants: (data.variants || []).map((variant: Product["variants"][number]) => ({ ...variant, discountedPrice: calculatePrice(variant.originalPrice, variant.discountType, variant.discountValue) })),
    discountedPrice: calculatePrice(data.originalPrice, data.discountType, data.discountValue),
  };
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!isServerConfigured) return defaultSettings;
  const snapshot = await getAdmin().db.doc("site/settings").get();
  return snapshot.exists ? { ...defaultSettings, ...serialize<SiteSettings>(snapshot.data()) } : defaultSettings;
});

export const getHeroSettings = cache(async (): Promise<HeroSettings> => {
  if (!isServerConfigured) return defaultHero;
  const snapshot = await getAdmin().db.doc("site/hero").get();
  return snapshot.exists ? { ...defaultHero, ...serialize<HeroSettings>(snapshot.data()) } : defaultHero;
});

export async function getProducts({ cursor, limit = 12, featured = false, admin = false }: { cursor?: string; limit?: number; featured?: boolean; admin?: boolean } = {}): Promise<ProductPage> {
  if (!isServerConfigured) return { products: [], nextCursor: null };
  let query = getAdmin().db.collection("products").orderBy(FieldPath.documentId()).limit(Math.min(limit, 100) + 1);
  if (!admin) query = query.where("active", "==", true);
  if (featured) query = query.where("featured", "==", true);
  if (cursor) query = query.startAfter(cursor);
  const snapshots = await query.get();
  const docs = snapshots.docs.slice(0, limit);
  return { products: docs.map(doc => productFromDocument(doc.id, doc.data())), nextCursor: snapshots.size > limit ? docs.at(-1)!.id : null };
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  if (!isServerConfigured) return null;
  const result = await getAdmin().db.collection("products").where("slug", "==", slug).where("active", "==", true).limit(1).get();
  const doc = result.docs[0];
  return doc ? productFromDocument(doc.id, doc.data()) : null;
});

export async function getProductById(id: string) {
  const doc = await getAdmin().db.collection("products").doc(id).get();
  return doc.exists ? productFromDocument(doc.id, doc.data()!) : null;
}
