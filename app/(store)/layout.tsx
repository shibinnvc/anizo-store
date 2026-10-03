import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getSiteSettings } from "@/lib/firestore";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return <><a href="#main-content" className="skip-link">Skip to content</a><Header settings={settings} /><main id="main-content">{children}</main><Footer settings={settings} /></>;
}
