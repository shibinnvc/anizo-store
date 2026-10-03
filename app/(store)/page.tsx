import type { Metadata } from "next";
import { getHeroSettings, getProducts, getSiteSettings } from "@/lib/firestore";
import { CinematicHero } from "@/components/hero/cinematic-hero";
import { BrandStory, Campaign, Collection, Contact, Philosophy } from "@/components/home/editorial";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return { title: `${settings.brandName} — ${settings.tagline}`, description: settings.seoDescription, alternates: { canonical: "/" }, openGraph: { title: settings.brandName, description: settings.seoDescription, url: "/" } };
}

export default async function HomePage() {
  const [hero, settings, featured] = await Promise.all([getHeroSettings(), getSiteSettings(), getProducts({ featured: true, limit: 4 })]);
  const { products } = featured.products.length ? featured : await getProducts({ limit: 4 });
  return <><CinematicHero hero={hero} /><div className="brand-ribbon" aria-hidden="true"><span>PERSONAL BY NATURE</span><span>✳</span><span>UNFORGETTABLE BY DESIGN</span><span>✳</span><span>THE WORLD OF ANIZO</span></div><Collection products={products} settings={settings} /><BrandStory settings={settings} /><Campaign settings={settings} /><Philosophy settings={settings} /><Contact settings={settings} /></>;
}
