import type { MediaAsset } from "@/types/product";
import type { HeroSettings, SiteSettings } from "@/types/site";

export const localAsset = (url: string, alt: string): MediaAsset => ({ url, alt, path: "", name: url.split("/").pop() || "", contentType: url.endsWith("mp4") ? "video/mp4" : "image/jpeg", size: 0 });

// Brand content is a first-run fallback and the starting point for the Firebase seed.
// Products deliberately have no hard-coded fallback.
export const defaultHero: HeroSettings = {
  enabled: true,
  video: localAsset("/media/campaign-desktop.mp4", "The ANIZO campaign film"),
  mobileVideo: localAsset("/media/campaign-mobile.mp4", "The ANIZO campaign film"),
  poster: localAsset("/media/campaign-portrait.jpg", "ANIZO fragrance balanced above a face in a monochrome campaign portrait"),
  eyebrow: "THE ART OF BEING UNFORGETTABLE",
  heading: "Some things\nare felt.",
  subtitle: "A quiet presence. An unforgettable impression.\nDiscover the world of ANIZO.",
  ctaText: "Discover the collection",
  ctaUrl: "/#collection",
  updatedAt: "",
};

export const defaultSettings: SiteSettings = {
  brandName: "ANIZO",
  whatsappNumber: "+919946120506",
  whatsappDefaultMessage: "Hello,\n\nI would like to order:",
  contactEmail: "",
  instagramUrl: "",
  logo: null,
  tagline: "A presence beyond words.",
  collectionHeading: "Find your signature.",
  collectionDescription: "Fragrance is personal. An expression of who you are, and a memory of where you’ve been.",
  storyEyebrow: "THE WORLD OF ANIZO",
  storyHeading: "Leave a little\nof yourself.",
  storyBody: "A fragrance is more than what you wear. It’s the feeling that stays when you leave.\n\nANIZO is an invitation to express yourself without saying a word. Personal. Instinctive. Entirely yours.",
  storyImage: localAsset("/media/campaign-intimacy.jpg", "A woman holds the frosted ANIZO fragrance close to her face"),
  campaignImage: localAsset("/media/campaign-triptych.jpg", "Three monochrome ANIZO campaign moments, from tailored evening wear to everyday denim"),
  campaignHeading: "Not just a fragrance.\nA feeling.",
  philosophyHeading: "The invisible.\nMade unforgettable.",
  philosophyBody: "The most powerful things don’t ask for attention. They simply stay with you. A moment. A person. A scent. This is our world.",
  contactHeading: "Your next signature\nstarts with a hello.",
  contactBody: "Discover your fragrance with a personal conversation. We’re here to help you find the one that feels like you.",
  seoDescription: "Discover ANIZO. Expressive fragrances, an intimate perspective, and a presence beyond words. Explore the collection and find your signature scent.",
  updatedAt: "",
};
