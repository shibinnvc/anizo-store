import { formatPrice } from "./utils";

export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s()+-]/g, "");
  if (!/^[1-9]\d{6,14}$/.test(cleaned)) throw new Error("Use an international WhatsApp number with country code (7–15 digits).");
  return cleaned;
}

export function createWhatsAppOrderUrl({ phone, productName, size, price, currency = "INR", quantity = 1, productUrl, defaultMessage = "Hello,\n\nI would like to order:" }: {
  phone: string; productName: string; size: string; price: number; currency?: string;
  quantity?: number; productUrl: string; defaultMessage?: string;
}) {
  const number = normalizePhone(phone);
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Quantity must be a positive integer.");
  if (!Number.isFinite(price) || price < 0) throw new Error("Invalid price.");
  const link = new URL(productUrl);
  if (!["https:", "http:"].includes(link.protocol)) throw new Error("Invalid product link.");
  const message = `${defaultMessage}\n\nProduct: ${productName}\nSize: ${size}\nPrice: ${formatPrice(price, currency)}\nQuantity: ${quantity}\n\nProduct Link:\n${link.href}\n\nPlease confirm availability.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function createWhatsAppContactUrl(phone: string, brandName: string) {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(`Hello ${brandName}, I would love to discover your fragrances.`)}`;
}
