import type { MediaAsset, ProductInput, ProductVariantInput } from "@/types/product";
import type { HeroSettings, SiteSettings } from "@/types/site";
import { calculatePrice, safeDestination } from "./utils";
import { normalizePhone } from "./whatsapp";

export class ValidationError extends Error {}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ValidationError("Invalid form data.");
  return value as Record<string, unknown>;
}
function text(value: unknown, label: string, max = 500, required = true): string {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new ValidationError(`${label} is required and must be under ${max} characters.`);
  return value.trim();
}
function bool(value: unknown): boolean {
  if (typeof value !== "boolean") throw new ValidationError("Invalid switch value.");
  return value;
}
function number(value: unknown, label: string, max = 10000000): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > max || Math.round(value * 100) / 100 !== value) throw new ValidationError(`${label} must be a valid non-negative number with at most 2 decimal places.`);
  return value;
}

export function parseMedia(value: unknown, kind: "image" | "video", prefix?: string): MediaAsset {
  const data = object(value);
  const url = text(data.url, "Media URL", 2500);
  const path = text(data.path, "Storage path", 500, false);
  const contentType = text(data.contentType, "Media type", 100);
  const allowed = kind === "image" ? ["image/jpeg", "image/png", "image/webp", "image/avif"] : ["video/mp4", "video/webm"];
  if (!allowed.includes(contentType)) throw new ValidationError("Unsupported media type.");
  if (path) {
    const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    let parsed: URL;
    try { parsed = new URL(url); } catch { throw new ValidationError("Invalid media URL."); }
    if (parsed.protocol !== "https:" || parsed.hostname !== "firebasestorage.googleapis.com" || parsed.pathname !== `/v0/b/${bucket}/o/${encodeURIComponent(path)}` || !/^(hero|site|products\/[a-zA-Z0-9_-]+)\/[^/]+$/.test(path) || path.includes("..") || (prefix && !path.startsWith(prefix + "/"))) throw new ValidationError("Media must belong to this website’s Storage bucket and section.");
  } else if (!/^\/media\/[a-z0-9-]+\.(jpg|jpeg|webp|png|avif|mp4|webm)$/.test(url)) {
    throw new ValidationError("Use an uploaded file or a supplied brand asset.");
  }
  return { url, path, contentType, name: text(data.name, "Filename", 200), alt: text(data.alt, "Image description", 300, kind === "image"), size: number(data.size, "File size", kind === "image" ? 10 * 1024 * 1024 : 60 * 1024 * 1024) };
}

export function parseProduct(value: unknown, id: string): ProductInput {
  const data = object(value);
  const name = text(data.name, "Product name", 120);
  const slug = text(data.slug, "Slug", 100);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new ValidationError("Slug must contain lowercase letters, numbers and single hyphens.");
  const originalPrice = number(data.originalPrice, "Price");
  if (!["none", "percentage", "fixed"].includes(String(data.discountType))) throw new ValidationError("Choose a valid discount type.");
  const discountType = data.discountType as ProductInput["discountType"];
  const discountValue = discountType === "none" ? 0 : number(data.discountValue, "Discount");
  try { calculatePrice(originalPrice, discountType, discountValue); } catch (e) { throw new ValidationError((e as Error).message); }
  const currency = text(data.currency, "Currency", 3);
  if (!["INR", "USD", "EUR", "GBP", "AED", "SAR"].includes(currency)) throw new ValidationError("Unsupported currency.");
  if (!Array.isArray(data.images) || data.images.length > 12) throw new ValidationError("Use up to 12 product images.");
  const images = data.images.map(item => parseMedia(item, "image", `products/${id}`));
  const active = bool(data.active);
  if (active && images.length === 0) throw new ValidationError("Add at least one image before publishing a product.");
  if (new Set(images.map(item => item.url)).size !== images.length) throw new ValidationError("Remove duplicate product images.");
  const notes = object(data.fragranceNotes);
  const parseNotes = (value: unknown) => {
    if (!Array.isArray(value) || value.length > 15) throw new ValidationError("Use at most 15 notes per layer.");
    return value.map(note => text(note, "Fragrance note", 80));
  };
  const size = text(data.size, "Size", 80);
  const rawVariants = data.variants ?? [];
  if (!Array.isArray(rawVariants) || rawVariants.length > 11) throw new ValidationError("Use at most 12 sizes or formats, including the primary size.");
  const variants: ProductVariantInput[] = rawVariants.map(value => {
    const variant = object(value);
    const variantId = text(variant.id, "Variant ID", 80);
    if (!/^[a-zA-Z0-9_-]+$/.test(variantId) || variantId === "default") throw new ValidationError("Invalid variant ID.");
    const price = number(variant.originalPrice, "Variant price");
    if (!["none", "percentage", "fixed"].includes(String(variant.discountType))) throw new ValidationError("Choose a valid variant discount type.");
    const type = variant.discountType as ProductVariantInput["discountType"];
    const discount = type === "none" ? 0 : number(variant.discountValue, "Variant discount");
    try { calculatePrice(price, type, discount); } catch (error) { throw new ValidationError((error as Error).message); }
    return { id: variantId, size: text(variant.size, "Variant size or format", 80), originalPrice: price, discountType: type, discountValue: discount, inStock: bool(variant.inStock), sku: text(variant.sku ?? "", "Variant SKU", 100, false) };
  });
  if (new Set(variants.map(variant => variant.id)).size !== variants.length) throw new ValidationError("Variant IDs must be unique.");
  const sizes = [size, ...variants.map(variant => variant.size)].map(value => value.toLowerCase().replace(/\s+/g, " "));
  if (new Set(sizes).size !== sizes.length) throw new ValidationError("Each size or format must have a unique label.");
  const gender = text(data.gender ?? "", "Gender", 20, false);
  if (!["", "unisex", "women", "men"].includes(gender)) throw new ValidationError("Choose a valid gender.");
  return { name, slug, originalPrice, discountType, discountValue, currency, images, active,
    shortDescription: text(data.shortDescription, "Short description", 300),
    fullDescription: text(data.fullDescription, "Description", 10000),
    size, featured: bool(data.featured), variants,
    inStock: bool(data.inStock ?? true), sku: text(data.sku ?? "", "SKU", 100, false),
    concentration: text(data.concentration ?? "", "Fragrance type / concentration", 100, false),
    gender: gender as ProductInput["gender"], scentProfile: parseNotes(data.scentProfile ?? []),
    longevity: text(data.longevity ?? "", "Longevity", 150, false),
    projection: text(data.projection ?? "", "Projection", 150, false),
    ingredients: text(data.ingredients ?? "", "Ingredients", 3000, false),
    howToUse: text(data.howToUse ?? "", "How to use", 2000, false),
    shippingAndReturns: text(data.shippingAndReturns ?? "", "Shipping and returns", 3000, false),
    fragranceNotes: { top: parseNotes(notes.top), heart: parseNotes(notes.heart), base: parseNotes(notes.base) },
    video: data.video ? parseMedia(data.video, "video", `products/${id}`) : null,
  };
}

export function parseHero(value: unknown): Omit<HeroSettings, "updatedAt"> {
  const data = object(value);
  const ctaUrl = text(data.ctaUrl, "CTA destination", 1000);
  if (!safeDestination(ctaUrl)) throw new ValidationError("Use a relative page path, anchor, or HTTPS link for the CTA.");
  return { enabled: bool(data.enabled), video: data.video ? parseMedia(data.video, "video", "hero") : null,
    mobileVideo: data.mobileVideo ? parseMedia(data.mobileVideo, "video", "hero") : null,
    poster: parseMedia(data.poster, "image", "hero"), eyebrow: text(data.eyebrow, "Eyebrow", 100),
    heading: text(data.heading, "Heading", 150), subtitle: text(data.subtitle, "Subtitle", 400),
    ctaText: text(data.ctaText, "CTA text", 80), ctaUrl,
  };
}

export function parseSettings(value: unknown): Omit<SiteSettings, "updatedAt"> {
  const data = object(value);
  const whatsappNumber = text(data.whatsappNumber, "WhatsApp number", 30, false);
  if (whatsappNumber) { try { normalizePhone(whatsappNumber); } catch (e) { throw new ValidationError((e as Error).message); } }
  const contactEmail = text(data.contactEmail, "Email", 200, false);
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) throw new ValidationError("Enter a valid contact email.");
  const instagramUrl = text(data.instagramUrl, "Instagram URL", 300, false);
  if (instagramUrl && !/^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/.test(instagramUrl)) throw new ValidationError("Enter a valid Instagram profile URL.");
  return {
    brandName: text(data.brandName, "Business name", 80), whatsappNumber, contactEmail, instagramUrl,
    whatsappDefaultMessage: text(data.whatsappDefaultMessage, "Order message introduction", 1000),
    logo: data.logo ? parseMedia(data.logo, "image", "site") : null,
    tagline: text(data.tagline, "Tagline", 150),
    collectionHeading: text(data.collectionHeading, "Collection heading", 150),
    collectionDescription: text(data.collectionDescription, "Collection description", 800),
    storyEyebrow: text(data.storyEyebrow, "Story eyebrow", 100),
    storyHeading: text(data.storyHeading, "Story heading", 150),
    storyBody: text(data.storyBody, "Story text", 3000),
    storyImage: parseMedia(data.storyImage, "image", "site"),
    campaignImage: parseMedia(data.campaignImage, "image", "site"),
    campaignHeading: text(data.campaignHeading, "Campaign heading", 150),
    philosophyHeading: text(data.philosophyHeading, "Philosophy heading", 150),
    philosophyBody: text(data.philosophyBody, "Philosophy text", 2000),
    contactHeading: text(data.contactHeading, "Contact heading", 150),
    contactBody: text(data.contactBody, "Contact text", 1000),
    seoDescription: text(data.seoDescription, "SEO description", 300),
  };
}
