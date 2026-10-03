import type { Product } from "@/types/product";

export function ProductProfile({ product }: { product: Product }) {
  const gender = { unisex: "Unisex", women: "Women", men: "Men", "": "" }[product.gender];
  const facts = [["Fragrance type", product.concentration], ["For", gender], ["Lasting", product.longevity], ["Projection", product.projection]].filter(([, value]) => value);
  return <>
    {product.scentProfile.length > 0 && <ul className="scent-profile" aria-label="Scent profile">{product.scentProfile.map((accord, index) => <li key={index}>{accord}</li>)}</ul>}
    {facts.length > 0 && <dl className="product-facts">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
  </>;
}

export function ProductInformation({ product, brandName }: { product: Product; brandName: string }) {
  return <>
    <details className="product-accordion" open><summary>The fragrance <span>+</span></summary><p className="preserve-lines">{product.fullDescription}</p></details>
    {Object.values(product.fragranceNotes).some(notes => notes.length) && <details className="product-accordion" open><summary>The composition <span>+</span></summary><dl className="notes-list">{(["top", "heart", "base"] as const).map(layer => product.fragranceNotes[layer].length > 0 && <div key={layer}><dt>{layer} notes</dt><dd>{product.fragranceNotes[layer].join(" · ")}</dd></div>)}</dl></details>}
    {[["Ingredients", product.ingredients], ["How to use", product.howToUse], ["Shipping & returns", product.shippingAndReturns]].filter(([, value]) => value).map(([label, value]) => <details className="product-accordion" key={label}><summary>{label}<span>+</span></summary><p className="preserve-lines">{value}</p></details>)}
    <details className="product-accordion"><summary>Ordering & delivery <span>+</span></summary><p>Select a size and Buy now to open your prepared order in WhatsApp. Send the message to confirm availability, payment arrangements, and delivery directly with {brandName}. You can share your delivery location in the chat.</p></details>
  </>;
}
