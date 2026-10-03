import assert from "node:assert/strict";
import { test } from "node:test";
import { parseProduct } from "../lib/validation";
import { getProductOptions, getStartingOption, productOptionPath } from "../lib/product-options";
import type { Product } from "../types/product";

const base = { name: "Test fragrance", slug: "test-fragrance", shortDescription: "Short", fullDescription: "Full", originalPrice: 2000, discountType: "percentage", discountValue: 10, currency: "INR", size: "50 ml", images: [], fragranceNotes: { top: [], heart: [], base: [] }, active: false, featured: false, video: null };
const oil = { id: "oil-10ml", size: "10 ml perfume oil", originalPrice: 600, discountType: "fixed", discountValue: 100, inStock: true, sku: "OIL10" };

test("legacy products remain editable and new fragrance details survive validation", () => {
  const legacy = parseProduct(base, "test");
  assert.equal(legacy.inStock, true);
  assert.deepEqual(legacy.variants, []);
  const product = parseProduct({ ...base, concentration: "Extrait de parfum", gender: "unisex", scentProfile: ["Fresh", "Amber"], longevity: "Up to 8 hours", projection: "2–3 hours", ingredients: "Confirmed label ingredients", howToUse: "Apply sparingly.", shippingAndReturns: "Contact us for delivery.", variants: [oil] }, "test");
  assert.deepEqual(product.variants, [oil]);
  assert.equal(product.projection, "2–3 hours");
  assert.deepEqual(product.scentProfile, ["Fresh", "Amber"]);
  assert.equal(product.howToUse, "Apply sparingly.");
});

test("invalid, duplicate and excessive product options are rejected", () => {
  for (const variant of [{ ...oil, id: "default" }, { ...oil, id: "../../oil" }, { ...oil, originalPrice: -1 }, { ...oil, discountValue: 601 }, { ...oil, inStock: "yes" }, { ...oil, size: "50 ml" }]) {
    assert.throws(() => parseProduct({ ...base, variants: [variant] }, "test"));
  }
  assert.throws(() => parseProduct({ ...base, variants: [oil, { ...oil, size: "Other size" }] }, "test"));
  assert.throws(() => parseProduct({ ...base, variants: [oil, { ...oil, id: "another", size: "10 ML   perfume oil" }] }, "test"));
  assert.throws(() => parseProduct({ ...base, variants: Array.from({ length: 12 }, (_, i) => ({ ...oil, id: `v${i}`, size: `Size ${i}` })) }, "test"));
  assert.throws(() => parseProduct({ ...base, gender: "invalid" }, "test"));
  assert.throws(() => parseProduct({ ...base, longevity: "x".repeat(151) }, "test"));
  assert.throws(() => parseProduct({ ...base, scentProfile: "Fresh" }, "test"));
});

test("option prices are recalculated and collection pricing prefers available sizes", () => {
  const input = parseProduct({ ...base, variants: [oil] }, "test");
  const product: Product = { ...input, id: "test", createdAt: "", updatedAt: "", discountedPrice: 1, hasDiscount: true, variants: [{ ...input.variants[0], discountedPrice: 1 }] };
  const options = getProductOptions(product);
  assert.equal(options[0].discountedPrice, 1800);
  assert.equal(options[1].discountedPrice, 500);
  assert.equal(getStartingOption(product).id, "oil-10ml");
  product.variants[0].inStock = false;
  assert.equal(getStartingOption(product).id, "default");
  product.inStock = false;
  assert.equal(getStartingOption(product).id, "oil-10ml");
  assert.equal(productOptionPath(product.slug), "/products/test-fragrance");
  assert.equal(productOptionPath(product.slug, "oil-10ml"), "/products/test-fragrance?variant=oil-10ml");
});
