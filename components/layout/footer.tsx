import Link from "next/link";
import { Logo } from "./logo";
import { Arrow } from "@/components/ui/icons";
import type { SiteSettings } from "@/types/site";

export function Footer({ settings }: { settings: SiteSettings }) {
  return <footer className="site-footer">
    <div className="footer-top"><p>{settings.tagline}</p><a href="#top" className="text-link">Back to top <Arrow className="-rotate-90" /></a></div>
    <Link href="/" aria-label={`${settings.brandName} home`} className="footer-wordmark"><Logo light asset={settings.logo} brandName={settings.brandName} /></Link>
    <div className="footer-bottom"><p>© {new Date().getFullYear()} {settings.brandName}. All rights reserved.</p><nav aria-label="Footer navigation"><Link href="/#collection">Collection</Link><Link href="/#our-world">Our world</Link>{settings.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram <Arrow diagonal width={12} height={12} /></a>}<Link href="/privacy">Privacy</Link></nav><span>Made to be remembered.</span></div>
  </footer>;
}
