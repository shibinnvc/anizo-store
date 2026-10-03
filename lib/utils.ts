import type { DiscountType } from "@/types/product";

export function calculatePrice(price: number, type: DiscountType, value: number): number {
  if (!Number.isFinite(price) || price < 0 || !Number.isFinite(value) || value < 0) throw new Error("Enter a valid price and discount.");
  if (type === "percentage" && value > 100) throw new Error("Percentage discount cannot exceed 100%.");
  if (type === "fixed" && value > price) throw new Error("Discount cannot exceed the original price.");
  const result = type === "percentage" ? price * (1 - value / 100) : type === "fixed" ? price - value : price;
  return Math.round((result + Number.EPSILON) * 100) / 100;
}

export function formatPrice(amount: number, currency = "INR") {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en", {
    style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(amount);
}

export function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
}

export function safeDestination(value: string): boolean {
  if (/[\s\\\u0000-\u001f]/.test(value)) return false;
  if (/^\/(?!\/)/.test(value) || /^#[a-zA-Z][\w-]*$/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
