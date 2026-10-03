import type { MediaAsset } from "./product";

export interface SiteSettings {
  brandName: string;
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  contactEmail: string;
  instagramUrl: string;
  logo: MediaAsset | null;
  tagline: string;
  collectionHeading: string;
  collectionDescription: string;
  storyEyebrow: string;
  storyHeading: string;
  storyBody: string;
  storyImage: MediaAsset;
  campaignImage: MediaAsset;
  campaignHeading: string;
  philosophyHeading: string;
  philosophyBody: string;
  contactHeading: string;
  contactBody: string;
  seoDescription: string;
  updatedAt: string;
}

export interface HeroSettings {
  enabled: boolean;
  video: MediaAsset | null;
  mobileVideo: MediaAsset | null;
  poster: MediaAsset;
  eyebrow: string;
  heading: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  updatedAt: string;
}
