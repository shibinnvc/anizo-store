import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/animations/reveal";
import { Arrow } from "@/components/ui/icons";
import { Price, DiscountBadge } from "./price";
import { BuyButton } from "./buy-button";
import type { Product } from "@/types/product";
import type { SiteSettings } from "@/types/site";
import { getStartingOption } from "@/lib/product-options";

export function ProductCard({ product, settings, index = 0 }: { product: Product; settings: SiteSettings; index?: number }) {
  const starting = { ...product, ...getStartingOption(product) };
  return <Reveal delay={Math.min(index * 0.08, 0.24)}><article className="product-card">
    <Link href={`/products/${product.slug}`} className="product-image-link" aria-label={`Discover ${product.name}`}>
      {product.images[0] && <Image src={product.images[0].url} alt={product.images[0].alt || product.name} fill sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 45vw" className="product-card-image" />}
      <span className="product-index">{String(index + 1).padStart(2, "0")} / THE COLLECTION</span><DiscountBadge product={starting} />
      <span className="product-discover">Discover the fragrance <Arrow diagonal /></span>
    </Link>
    <div className="product-card-heading"><div><p className="eyebrow">{product.variants.length ? `${product.variants.length + 1} sizes / formats` : product.size}</p><h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3></div><div>{product.variants.length > 0 && <span className="price-from">From</span>}<Price product={starting} /></div></div>
    <p className="product-short">{product.shortDescription}</p>
    <div className="product-card-actions"><Link href={`/products/${product.slug}`} className="text-link">View product <Arrow diagonal width={15} height={15} /></Link><BuyButton compact product={product} settings={settings} /></div>
  </article></Reveal>;
}
