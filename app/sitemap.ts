import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/firestore";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = ["", "/products", "/privacy"].map(path => ({ url: `${siteUrl()}${path}`, changeFrequency: "weekly", priority: path ? 0.7 : 1 }));
  let cursor: string | undefined;
  do {
    const page = await getProducts({ cursor, limit: 100 });
    urls.push(...page.products.map(product => ({ url: `${siteUrl()}/products/${product.slug}`, lastModified: product.updatedAt || undefined, priority: 0.8 })));
    cursor = page.nextCursor || undefined;
  } while (cursor && urls.length < 49000);
  return urls;
}
