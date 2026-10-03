import assert from "node:assert/strict";
import { test } from "node:test";
import { calculatePrice, formatPrice, safeDestination, slugify } from "../lib/utils";
import { createWhatsAppOrderUrl, normalizePhone } from "../lib/whatsapp";
import { parseHero, parseProduct, parseSettings } from "../lib/validation";
import { defaultHero, defaultSettings } from "../lib/defaults";

test("selling prices retain paise and support all discount types", () => {
  assert.equal(calculatePrice(4999, "none", 0), 4999);
  assert.equal(calculatePrice(4999, "percentage", 20), 3999.2);
  assert.equal(calculatePrice(4999, "fixed", 1000), 3999);
  assert.equal(calculatePrice(0.3, "percentage", 10), 0.27);
  assert.equal(calculatePrice(100, "percentage", 100), 0);
  assert.equal(formatPrice(3999.2, "INR"), "₹3,999.2");
});
test("invalid prices and excessive discounts are rejected", () => {
  for (const price of [-1, NaN, Infinity]) assert.throws(() => calculatePrice(price, "none", 0));
  assert.throws(() => calculatePrice(100, "percentage", 101));
  assert.throws(() => calculatePrice(100, "fixed", 101));
  assert.throws(() => calculatePrice(100, "fixed", -1));
});
test("WhatsApp safely preserves Unicode, line breaks, quantities and product links", () => {
  const order = { phone: "+91 98765 43210", productName: "ANIZO & Rose #1", size: "50 ml", price: 3999.2, quantity: 2, productUrl: "https://anizo.example/products/rose?ref=a&size=50" };
  const url = new URL(createWhatsAppOrderUrl(order));
  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.pathname, "/919876543210");
  const message = url.searchParams.get("text")!;
  assert.match(message, /Product: ANIZO & Rose #1/);
  assert.match(message, /Price: ₹3,999.2/);
  assert.match(message, /Quantity: 2/);
  assert.ok(message.includes(order.productUrl));
  assert.match(message, /Please confirm availability\.$/);
  assert.throws(() => createWhatsAppOrderUrl({ ...order, productUrl: "javascript:alert(1)" }));
  assert.throws(() => createWhatsAppOrderUrl({ ...order, quantity: 0 }));
  assert.throws(() => createWhatsAppOrderUrl({ ...order, quantity: 1.5 }));
});
test("phone and destination validation blocks unsafe links", () => {
  assert.equal(normalizePhone("+91 (98765) 43210"), "919876543210");
  for (const value of ["0001234567", "123", "919876543210?text=hi", "919876543210/../123"]) assert.throws(() => normalizePhone(value));
  for (const value of ["/#collection", "/products/scent", "#contact", "https://example.com/path"]) assert.equal(safeDestination(value), true);
  for (const value of ["//evil.example", "/\\evil.example", "javascript:alert(1)", "data:text/html,test", "https://user:pass@example.com", "/\n/evil.example"]) assert.equal(safeDestination(value), false);
  assert.equal(slugify("L’Été — No. 1"), "l-ete-no-1");
});
test("brand defaults are valid and scripts cannot enter hero CTA", () => {
  assert.equal(parseHero(defaultHero).heading, defaultHero.heading);
  assert.equal(parseSettings(defaultSettings).brandName, "ANIZO");
  assert.throws(() => parseHero({ ...defaultHero, ctaUrl: "javascript:alert(1)" }));
  assert.throws(() => parseSettings({ ...defaultSettings, whatsappNumber: "not-a-number" }));
});
test("product validation rejects publishing without images and invalid media ownership", () => {
  const product = { name: "Test", slug: "test", shortDescription: "Short", fullDescription: "Full", originalPrice: 100, discountType: "none", discountValue: 0, currency: "INR", size: "50 ml", images: [], fragranceNotes: { top: [], heart: [], base: [] }, active: false, featured: false, video: null };
  assert.equal(parseProduct(product, "test-id").active, false);
  assert.throws(() => parseProduct({ ...product, active: true }, "test-id"));
  assert.throws(() => parseProduct({ ...product, discountType: "percentage", discountValue: 101 }, "test-id"));
  assert.throws(() => parseProduct({ ...product, slug: "../../unsafe" }, "test-id"));
  assert.throws(() => parseProduct({ ...product, images: [{ ...defaultHero.poster, path: "products/other/file.jpg", url: "https://evil.example/file.jpg" }] }, "test-id"));
});
