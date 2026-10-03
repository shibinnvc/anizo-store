import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/animations/reveal";
import { ParallaxImage } from "@/components/animations/parallax-image";
import { Arrow, WhatsAppIcon } from "@/components/ui/icons";
import { ProductCard } from "@/components/products/product-card";
import { createWhatsAppContactUrl } from "@/lib/whatsapp";
import type { SiteSettings } from "@/types/site";
import type { Product } from "@/types/product";

export function Collection({ products, settings }: { products: Product[]; settings: SiteSettings }) {
  return <section id="collection" className="collection-section section-pad">
    <Reveal className="section-heading"><div><span className="eyebrow">01 — THE COLLECTION</span><h2>{settings.collectionHeading}</h2></div><p>{settings.collectionDescription}</p></Reveal>
    {products.length > 0 ? <><div className="product-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} settings={settings} index={index} />)}</div><Reveal className="collection-bottom"><span>A scent that feels like you.</span><Link href="/products" className="text-link">Explore all fragrances <Arrow diagonal /></Link></Reveal></> : <CollectionPreview />}
  </section>;
}

function CollectionPreview() {
  return <div className="collection-preview"><Reveal className="collection-preview-image"><Image src="/media/bottle.jpg" alt="The signature frosted ANIZO bottle" fill sizes="(max-width: 700px) 100vw, 50vw" className="object-cover" /><span className="product-index">ANIZO / A FIRST LOOK</span></Reveal><Reveal className="collection-preview-copy"><span className="eyebrow">THE SIGNATURE EDIT</span><h3>Quietly bold.<br /><em>Entirely you.</em></h3><p>A first look at the world of ANIZO. Our fragrance collection will be revealed here soon.</p><Link href="/#contact" className="text-link">Get in touch <Arrow diagonal /></Link><Image src="/media/bottle-duo.jpg" alt="ANIZO bottle and travel spray reflected in a mirror" width={2304} height={4096} sizes="(max-width: 700px) 35vw, 20vw" className="preview-detail" /></Reveal></div>;
}

export function BrandStory({ settings }: { settings: SiteSettings }) {
  return <section id="our-world" className="story-section"><ParallaxImage asset={settings.storyImage} className="story-image" sizes="(max-width: 800px) 100vw, 55vw" /><Reveal className="story-copy"><span className="eyebrow">02 — {settings.storyEyebrow}</span><h2 className="preserve-lines">{settings.storyHeading}</h2><div className="story-body">{settings.storyBody.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}</div><Link href="#philosophy" className="text-link">Behind the feeling <Arrow diagonal /></Link><span className="story-mark" aria-hidden="true">a.</span></Reveal></section>;
}

export function Campaign({ settings }: { settings: SiteSettings }) {
  return <section className="campaign-section" aria-label="ANIZO campaign"><ParallaxImage asset={settings.campaignImage} /><div className="campaign-shade" /><Reveal className="campaign-copy"><span className="eyebrow">WORN CLOSE. REMEMBERED LONG.</span><h2 className="preserve-lines">{settings.campaignHeading}</h2></Reveal></section>;
}

export function Philosophy({ settings }: { settings: SiteSettings }) {
  return <section id="philosophy" className="philosophy-section section-pad"><Reveal><span className="eyebrow">03 — THE PHILOSOPHY</span><h2 className="preserve-lines">{settings.philosophyHeading}</h2><div className="philosophy-bottom"><span className="philosophy-symbol" aria-hidden="true">✳</span><p>{settings.philosophyBody}</p><span className="eyebrow philosophy-signature">A PRESENCE<br />BEYOND WORDS.</span></div></Reveal></section>;
}

export function Contact({ settings }: { settings: SiteSettings }) {
  let href = "";
  try { if (settings.whatsappNumber) href = createWhatsAppContactUrl(settings.whatsappNumber, settings.brandName); } catch { /* No unsafe contact URL. */ }
  return <section id="contact" className="contact-section section-pad"><Reveal><span className="eyebrow">LET’S FIND YOUR FRAGRANCE</span><h2 className="preserve-lines">{settings.contactHeading}</h2><p>{settings.contactBody}</p>{href ? <a className="button button-light" href={href} target="_blank" rel="noopener noreferrer"><WhatsAppIcon />Let’s talk on WhatsApp<Arrow diagonal /></a> : settings.contactEmail ? <a className="button button-light" href={`mailto:${settings.contactEmail}`}>Say hello <Arrow diagonal /></a> : <p className="contact-coming">A new conversation is coming soon.</p>}</Reveal></section>;
}
