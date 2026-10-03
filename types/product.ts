export interface MediaAsset {
  url: string;
  path: string;
  name: string;
  contentType: string;
  size: number;
  alt: string;
}

export type DiscountType = "none" | "percentage" | "fixed";

export interface ProductVariantInput {
  id: string;
  size: string;
  originalPrice: number;
  discountType: DiscountType;
  discountValue: number;
  inStock: boolean;
  sku: string;
}

export interface ProductVariant extends ProductVariantInput {
  discountedPrice: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  images: MediaAsset[];
  video: MediaAsset | null;
  originalPrice: number;
  discountType: DiscountType;
  discountValue: number;
  discountedPrice: number;
  currency: string;
  hasDiscount: boolean;
  fragranceNotes: { top: string[]; heart: string[]; base: string[] };
  size: string;
  inStock: boolean;
  sku: string;
  variants: ProductVariant[];
  concentration: string;
  gender: "" | "unisex" | "women" | "men";
  scentProfile: string[];
  longevity: string;
  projection: string;
  ingredients: string;
  howToUse: string;
  shippingAndReturns: string;
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt" | "discountedPrice" | "hasDiscount" | "variants"> & { variants: ProductVariantInput[] };
export interface ProductPage { products: Product[]; nextCursor: string | null }
