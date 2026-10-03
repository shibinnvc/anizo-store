import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, getSiteSettings } from "@/lib/firestore";
import { ProductCard } from "@/components/products/product-card";
import { Arrow } from "@/components/ui/icons";

export const metadata: Metadata = { title: "The collection", description: "Explore the ANIZO fragrance collection and find your signature.", alternates: { canonical: "/products" } };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ after?: string }> }) {
  const { after } = await searchParams;
  const [{ products, nextCursor }, settings] = await Promise.all([getProducts({ cursor: typeof after === "string" && /^[\w-]{1,100}$/.test(after) ? after : undefined }), getSiteSettings()]);
  return <div className="collection-page section-pad"><div className="section-heading"><div><span className="eyebrow">ANIZO / THE COLLECTION</span><h1>{settings.collectionHeading}</h1></div><p>{settings.collectionDescription}</p></div>{products.length ? <div className="product-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} settings={settings} index={index} />)}</div> : <div className="empty-collection"><h2>{after ? "You’ve seen the collection." : "Something personal is coming."}</h2><p>{after ? "Return to the beginning to find your signature." : "Our fragrances will be revealed here soon. In the meantime, step inside the world of ANIZO."}</p><Link href={after ? "/products" : "/#our-world"} className="text-link">{after ? "Back to collection" : "Discover our world"} <Arrow diagonal /></Link></div>}<div className="pagination">{after && <Link href="/products" className="text-link">Back to first page</Link>}{nextCursor && <Link href={`/products?after=${encodeURIComponent(nextCursor)}`} className="button button-dark">More fragrances <Arrow /></Link>}</div></div>;
}
