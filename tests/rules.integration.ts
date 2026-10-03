import { readFile } from "node:fs/promises";
import { after, before, test } from "node:test";
import { initializeTestEnvironment, assertFails, assertSucceeds, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { deleteObject, getBytes, ref, uploadBytes } from "firebase/storage";

let environment: RulesTestEnvironment;
const sample = { name: "Test fragrance", slug: "test-fragrance", shortDescription: "Test", fullDescription: "Test", images: [{ url: "/media/bottle.jpg" }], originalPrice: 100, discountType: "none", discountValue: 0, discountedPrice: 100, currency: "INR", size: "50 ml", fragranceNotes: { top: [], heart: [], base: [] }, active: true, featured: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" };

before(async () => {
  environment = await initializeTestEnvironment({ projectId: "demo-anizo", firestore: { host: "127.0.0.1", port: 8080, rules: await readFile("firestore.rules", "utf8") }, storage: { host: "127.0.0.1", port: 9199, rules: await readFile("storage.rules", "utf8") } });
  await environment.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), "products/active"), sample);
    await setDoc(doc(context.firestore(), "products/draft"), { ...sample, active: false });
    await setDoc(doc(context.firestore(), "site/settings"), { brandName: "ANIZO" });
    await setDoc(doc(context.firestore(), "site/private"), { secret: "not-public" });
    await uploadBytes(ref(context.storage(), "products/active/test.jpg"), new Uint8Array([1,2,3]), { contentType: "image/jpeg" });
    await uploadBytes(ref(context.storage(), "products/draft/test.jpg"), new Uint8Array([1,2,3]), { contentType: "image/jpeg" });
  });
});
after(async () => { await environment?.cleanup(); });

test("public reads are restricted to active products and public configuration", async () => {
  const db = environment.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(db, "products/active")));
  await assertFails(getDoc(doc(db, "products/draft")));
  await assertSucceeds(getDocs(query(collection(db, "products"), where("active", "==", true))));
  await assertFails(getDocs(collection(db, "products")));
  await assertSucceeds(getDoc(doc(db, "site/settings")));
  await assertFails(getDoc(doc(db, "site/private")));
  await assertFails(getDoc(doc(db, "productSlugs/test")));
});
test("anonymous and ordinary authenticated users cannot mutate content", async () => {
  for (const context of [environment.unauthenticatedContext(), environment.authenticatedContext("customer")]) {
    const db = context.firestore();
    await assertFails(setDoc(doc(db, "products/unauthorized"), sample));
    await assertFails(setDoc(doc(db, "products/active"), { ...sample, name: "Changed" }));
    await assertFails(deleteDoc(doc(db, "products/active")));
    await assertFails(setDoc(doc(db, "site/settings"), { brandName: "Changed" }));
    await assertFails(uploadBytes(ref(context.storage(), "hero/unauthorized.jpg"), new Uint8Array([1]), { contentType: "image/jpeg" }));
    await assertFails(deleteObject(ref(context.storage(), "products/active/test.jpg")));
  }
});
test("admin claims allow valid management, while invalid data and file types are rejected", async () => {
  const context = environment.authenticatedContext("owner", { admin: true });
  await assertSucceeds(setDoc(doc(context.firestore(), "products/admin-created"), sample));
  await assertSucceeds(getDoc(doc(context.firestore(), "products/draft")));
  await assertSucceeds(deleteDoc(doc(context.firestore(), "products/admin-created")));
  await assertFails(setDoc(doc(context.firestore(), "products/invalid"), { ...sample, originalPrice: -1 }));
  await assertSucceeds(setDoc(doc(context.firestore(), "site/hero"), { heading: "Test" }));
  await assertSucceeds(uploadBytes(ref(context.storage(), "hero/admin-test.jpg"), new Uint8Array([1,2]), { contentType: "image/jpeg" }));
  await assertFails(uploadBytes(ref(context.storage(), "hero/script.svg"), new Uint8Array([1,2]), { contentType: "image/svg+xml" }));
  await assertFails(uploadBytes(ref(context.storage(), "hero/large.jpg"), new Uint8Array(10 * 1024 * 1024 + 1), { contentType: "image/jpeg" }));
  await assertSucceeds(deleteObject(ref(context.storage(), "hero/admin-test.jpg")));
});
test("draft product media is not publicly readable through the Storage SDK", async () => {
  const storage = environment.unauthenticatedContext().storage();
  await assertSucceeds(getBytes(ref(storage, "products/active/test.jpg")));
  await assertFails(getBytes(ref(storage, "products/draft/test.jpg")));
});

test("product variants require valid sizes, prices, discounts and availability", async () => {
  const db = environment.authenticatedContext("owner", { admin: true }).firestore();
  const variant = { id: "oil", size: "10 ml perfume oil", originalPrice: 600, discountType: "fixed", discountValue: 100, discountedPrice: 500, sku: "OIL10", inStock: true };
  await assertSucceeds(setDoc(doc(db, "products/variants"), { ...sample, inStock: true, variants: [variant] }));
  for (const invalid of [{ ...variant, originalPrice: -1 }, { ...variant, discountedPrice: 900 }, { ...variant, discountValue: 700 }, { ...variant, id: "default" }, { ...variant, inStock: "yes" }]) {
    await assertFails(setDoc(doc(db, "products/variants"), { ...sample, variants: [invalid] }));
  }
  await assertFails(setDoc(doc(db, "products/variants"), { ...sample, variants: Array.from({ length: 12 }, () => variant) }));
});
