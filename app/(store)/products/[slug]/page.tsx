import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getSiteSettings } from "@/lib/firestore";
import { Gallery } from "@/components/products/gallery";
import { ProductProfile, ProductInformation } from "@/components/products/product-details";
import { getProductOptions, productOptionPath } from "@/lib/product-options";
import { ProductPurchase } from "@/components/products/product-purchase";
import { ProductVideo } from "@/components/hero/product-video";
import { siteUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ variant?: string | string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Fragrance not found", robots: { index: false } };
  return { title: product.name, description: product.shortDescription, alternates: { canonical: `/products/${product.slug}` }, openGraph: { title: product.name, description: product.shortDescription, images: product.images.map(image => ({ url: image.url, alt: image.alt })) } };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const [product, settings] = await Promise.all([getProductBySlug((await params).slug), getSiteSettings()]);
  if (!product) notFound();
  const query = await searchParams;
  const initialVariantId = typeof query.variant === "string" ? query.variant : undefined;
  const schema = { "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.shortDescription, image: product.images.map(image => new URL(image.url, siteUrl()).href), brand: { "@type": "Brand", name: settings.brandName }, sku: product.id, offers: getProductOptions(product).map(option => ({ "@type": "Offer", url: `${siteUrl()}${productOptionPath(product.slug, option.id)}`, name: option.size, sku: option.sku || `${product.id}-${option.id}`, price: option.discountedPrice, priceCurrency: product.currency, availability: option.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" })) };
  return <article className="product-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} /><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/products">The collection</Link><span>/</span><span aria-current="page">{product.name}</span></nav><div className="product-detail-grid"><Gallery images={product.images} name={product.name} /><div className="product-detail-copy"><span className="eyebrow">ANIZO / THE FRAGRANCE</span><h1>{product.name}</h1><p className="product-lead">{product.shortDescription}</p><ProductProfile product={product} /><ProductPurchase key={`${product.id}-${product.updatedAt}`} product={product} settings={settings} initialVariantId={initialVariantId} /><ProductInformation product={product} brandName={settings.brandName} /></div></div>{product.video && <section className="product-film-section section-pad"><span className="eyebrow">A CLOSER LOOK</span><ProductVideo video={product.video} poster={product.images[0]?.url} /></section>}</article>;
}
