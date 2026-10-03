import type { Product, ProductInput, ProductVariant } from "@/types/product";
import { calculatePrice } from "./utils";

export function hasProductDiscount(product: Pick<ProductInput, "originalPrice" | "discountType" | "discountValue" | "variants">) {
  return [product, ...(product.variants || [])].some(option => calculatePrice(option.originalPrice, option.discountType, option.discountValue) < option.originalPrice);
}

export function getProductOptions(product: Product): ProductVariant[] {
  const primary: ProductVariant = {
    id: "default", size: product.size, originalPrice: product.originalPrice,
    discountType: product.discountType, discountValue: product.discountValue,
    discountedPrice: calculatePrice(product.originalPrice, product.discountType, product.discountValue),
    inStock: product.inStock ?? true, sku: product.sku || "",
  };
  return [primary, ...(product.variants || []).map(variant => ({
    ...variant, discountedPrice: calculatePrice(variant.originalPrice, variant.discountType, variant.discountValue),
  }))];
}

export function getStartingOption(product: Product): ProductVariant {
  const options = getProductOptions(product);
  const available = options.filter(option => option.inStock);
  return (available.length ? available : options).reduce((lowest, option) => option.discountedPrice < lowest.discountedPrice ? option : lowest);
}

export function productOptionPath(slug: string, optionId = "default") {
  const path = `/products/${encodeURIComponent(slug)}`;
  return optionId === "default" ? path : `${path}?${new URLSearchParams({ variant: optionId })}`;
}
