import type { Metadata, Viewport } from "next";
import { AnimationProvider } from "@/components/animations/provider";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "ANIZO — A presence beyond words", template: "%s | ANIZO" },
  description: "Discover ANIZO. Expressive fragrances and a presence beyond words.",
  openGraph: { type: "website", siteName: "ANIZO", locale: "en_IN", images: [{ url: "/media/campaign-portrait.jpg", width: 1920, height: 1080, alt: "ANIZO fragrance campaign" }] },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = { themeColor: "#f1eee8", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body id="top"><AnimationProvider>{children}</AnimationProvider></body></html>;
}
