# ANIZO implementation

## Visual source of truth

The supplied black and white SVG wordmarks, five 1920 × 1080 campaign photographs, two bottle photographs and campaign MP4 define the identity. Use ink black, warm ivory, neutral grey, oversized serif editorial headlines and restrained sans-serif labels. No stock imagery or invented product claims. The supplied video was initially an iCloud placeholder; see README for media preparation.

## Architecture

Next.js App Router and TypeScript. Server components read published Firestore documents through a server-only data layer. Client components are limited to interaction, Motion animation, galleries, video and admin forms. Public content is fetched per request, so published changes are immediately visible. Products are paginated and slugs are reserved transactionally.

Firebase Auth email/password login exchanges a recent admin ID token for a secure HTTP-only session. Every admin page and mutation verifies the session, revocation, and current custom claims. Product/config writes use authenticated server endpoints with same-origin validation. Storage uploads use the Firebase client SDK and admin-only rules. Firestore and Storage rules deny unauthorised writes independently of the UI.

## Firestore

- `products/{id}`: reusable typed product, computed selling price, notes, image metadata, optional video, publication flags and timestamps.
- `productSlugs/{slug}`: unique reservation; private to admins.
- `site/settings`: public business name, WhatsApp settings, logo and editorial content.
- `site/hero`: media metadata, desktop/mobile video, poster, text and CTA.

Only public configuration lives in `site`. No credentials or customer data are stored there. Media includes a Storage path for safe cleanup after a successful save. Files not attached to a saved document are removable from the admin media library.

## Components and animation

Shared navigation/footer, responsive video, editorial sections, product card, price, gallery and order action. Motion uses opacity and transform with viewport reveals, gentle parallax and brief page entrances. Native scrolling is preserved; no GSAP dependency is needed for this direction. Reduced-motion and data-saving users receive a static hero with an explicit play control. No loading screen blocks content.

## Responsive strategy

Full viewport desktop hero and stable small-viewport mobile hero. Dedicated mobile media selection happens before setting a video source. Editorial columns stack with deliberate spacing; product galleries support native horizontal swipe and thumbnail selection. Admin sidebar becomes a compact mobile navigation. All controls have visible focus states and touch targets.

## Delivery sequence

1. Foundation, asset integration and typed models.
2. Cinematic storefront, dynamic collection and product pages.
3. Session authentication, admin CRUD, media and settings.
4. Security rules, setup scripts and deployment documentation.
5. Pricing/URL/security tests, lint, TypeScript, production build and browser verification.
