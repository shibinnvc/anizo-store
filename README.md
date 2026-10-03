# ANIZO — a presence beyond words

A cinematic fragrance storefront and secure Firebase brand studio, built from the supplied ANIZO assets.

## Run locally

Use Node.js 22 or newer (Node 24 recommended).

```sh
npm ci
test -f .env.local || cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. This working copy is connected to `anizo-fragrances-2026`; see [Firebase setup status](docs/firebase-setup.md) for completed setup and the remaining billing step. The supplied campaign, wordmarks and product photography work immediately. Until Firebase is configured, the collection shows an editorial preview, there are no invented products or prices, and admin sign-in is disabled. After Firebase is connected, products come exclusively from Firestore. An empty database never falls back to fake products.

On this Mac, iCloud was offloading files inside `node_modules`. The local working copy keeps dependencies and build cache in ignored `.nosync` directories with conventional `node_modules` and `.next` symlinks. These are local development artifacts, not application requirements. A fresh clone outside iCloud uses a normal `npm ci`; keeping development projects outside an optimized iCloud Desktop avoids interrupted package reads.

## Firebase setup

1. Create a Firebase project and register a Web app. Copy its public configuration into the six `NEXT_PUBLIC_FIREBASE_*` variables in `.env.local`.
2. Enable **Authentication → Sign-in method → Email/Password**. Add your production hostname to Authorized domains. Public user registration is not exposed by this app.
3. Create a Firestore database in production mode and choose a region close to your users and application server.
4. Enable Cloud Storage. Use the bucket name shown in the console (newer buckets often end in `.firebasestorage.app`). Firebase Storage requires an appropriate billing-enabled plan; check the current Firebase console requirements.
5. Configure server credentials using either a service-account JSON outside the repository and `GOOGLE_APPLICATION_CREDENTIALS`, or `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`. The private key supports literal `\n` escapes. Never put server credentials in `NEXT_PUBLIC_*` variables or commit the JSON file. The runtime account needs Firebase Authentication administration, Firestore data access, and object management for the configured bucket.
6. Set `NEXT_PUBLIC_SITE_URL` to the exact origin used to access the app, without a trailing slash. Use `http://localhost:3000` locally and your HTTPS domain in production. The value powers canonical links and same-origin mutation protection.
7. Deploy the security rules and indexes:

```sh
npx firebase login
npx firebase use --add
npx firebase deploy --only firestore:rules,firestore:indexes,storage
```

When prompted during Storage rule deployment, enable cross-service Firestore permissions. Product media rules consult each product’s publication status. Wait for Firestore indexes to finish building before opening the dashboard.

8. Initialize brand content and upload the supplied campaign media to your Storage bucket:

```sh
npm run content:seed
```

This creates `site/settings` and `site/hero` only when absent. Existing documents are never overwritten. It uploads the actual supplied imagery and the optimized desktop/mobile film, saves media metadata and URLs, and cleans up uploads if a document cannot be created. It does not create products. The initial business WhatsApp number is the owner-confirmed +91 99461 20506 and remains editable in Website settings. Use `--local-media` to seed the supplied local media references while Storage is not yet provisioned. After Storage is enabled, `npm run content:seed -- --migrate-local-media` uploads only those local brand assets and preserves the existing site copy and settings.

9. Restart the development server after environment changes.

## Create the first administrator

The configured ANIZO project already has its first administrator, `shibincrt10@gmail.com`. Its temporary first-login details are stored locally in `.secrets.nosync/admin-login.txt`; change the password after signing in. To grant an existing Firebase Auth user access in another environment, run:

```sh
npm run admin:grant -- grant owner@example.com
```

Visit `/admin/login` and sign in. This script preserves unrelated custom claims and revokes existing sessions, so sign out and sign back in after a role change. To remove access:

```sh
npm run admin:grant -- revoke owner@example.com
```

Do not create a public endpoint that grants admin access. Account recovery and additional administrator creation are handled by the Firebase project owner. A Firebase account alone does not grant studio access.

## Maintain the website

- **Overview:** total, active and discounted product counts, current hero preview and quick actions.
- **Products:** create, edit or delete fragrances; set active/featured status, images and an optional film. Add up to 12 sizes/formats with separate prices, discounts, SKUs and availability. Enter fragrance type/concentration, gender, scent profile, top/heart/base notes, longevity, projection, ingredients, usage instructions, and shipping/returns information. New products begin as drafts. Publishing requires a cover image. Slugs are reserved atomically; duplicate slugs and stale concurrent edits are rejected. Keep published slugs stable to preserve existing links.
- **Hero management:** desktop/mobile film, required poster, enabled state, eyebrow, heading, subtitle and CTA. All uploads show progress and validate size/type.
- **Website settings:** business name, contact details, WhatsApp number and order introduction, logo, collection copy, story text/image, campaign, philosophy and SEO description. Leave the WhatsApp number empty to pause orders. A custom raster logo should be legible on both light and dark backgrounds; the supplied SVG has dedicated versions for each.
- **Media library:** inspect Storage uploads and delete abandoned files. Attached files are protected by the deletion endpoint. Replaced/deleted product assets are removed after a successful document save; failures produce actionable feedback.

Product name, URL slug, short/full descriptions, primary size, price and currency are required. Every additional option requires a unique size/format label and valid pricing. At least one image is required before publishing. Profile and care fields are optional and remain hidden on the public page when empty. Customers choose a size before ordering; WhatsApp receives that option’s exact size, price, quantity and shareable link. Sold-out sizes cannot be ordered. The collection shows the lowest available option price, and the dashboard counts offers across all sizes.

The first product photograph becomes the collection cover. Images can be reordered and each has an editable description. Images are limited to 10 MB each, 12 per product; videos to 60 MB. Accepted image formats are JPEG, PNG, WebP and AVIF. SVG uploads are intentionally excluded; supplied trusted SVG wordmarks are local assets.

## Architecture

```text
app/(store)/                 Server-rendered public pages and layout
app/(store)/products/[slug]/ Product metadata, gallery, notes and ordering
app/admin/login/             Firebase email/password sign-in
app/admin/(protected)/       Dashboard, product CRUD, hero, settings, media
app/api/auth/session/        Verified HTTP-only Firebase session exchange
app/api/admin/               Session-protected mutation endpoints
components/                  Layout, editorial, Motion, media, product/admin UI
lib/firestore.ts             Server-only published-content reads
lib/firebase.ts              Lazy Firebase browser SDK initialization
lib/firebase-admin.ts        Server-only credentials and Admin SDK
lib/auth.ts                  Session revocation, current claims, origin checks
lib/validation.ts            Server validation and media ownership checks
lib/storage.ts               Resumable uploads and progress
lib/whatsapp.ts              Encoded, reusable WhatsApp links
types/                       Shared product, media and site models
scripts/                     Admin claim management and initial content import
tests/                       Commerce, input safety and emulator rule tests
```

The public layout uses request-time server rendering so saved products, prices and settings become visible on the next request. React request memoization avoids duplicate site/product reads within a render. Product listings and admin media use cursor pagination; Firestore stores any number of products. The sitemap emits up to 49,000 product URLs; introduce partitioned sitemaps if the catalogue grows beyond that.

### Firestore model

```text
products/{id}
  name, slug, shortDescription, fullDescription
  originalPrice, discountType, discountValue, discountedPrice, currency
  size, sku, inStock, fragranceNotes: { top: [], heart: [], base: [] }
  variants: [{ id, size, sku, inStock, originalPrice, discountType, discountValue, discountedPrice }]
  hasDiscount (computed across primary and additional options)
  concentration, gender, scentProfile[], longevity, projection
  ingredients, howToUse, shippingAndReturns
  images: MediaAsset[], video: MediaAsset | null
  featured, active, createdAt, updatedAt

productSlugs/{slug}
  productId

site/hero
  enabled, video, mobileVideo, poster, eyebrow
  heading, subtitle, ctaText, ctaUrl, updatedAt

site/settings
  brandName, whatsappNumber, whatsappDefaultMessage
  contactEmail, instagramUrl, logo, tagline
  collectionHeading, collectionDescription
  storyEyebrow, storyHeading, storyBody, storyImage
  campaignImage, campaignHeading
  philosophyHeading, philosophyBody
  contactHeading, contactBody, seoDescription, updatedAt
```

`MediaAsset = { url, path, name, contentType, size, alt }`. Storage paths enable safe cleanup. Timestamps are server-generated ISO 8601 strings. Prices are rounded to two decimal places and recalculated on save and read. For example, ₹4,999 less 20% is ₹3,999.20; a fixed ₹1,000 discount gives ₹3,999. The application preserves the actual calculated amount instead of silently rounding away paise.

### Security boundaries

Every protected page and API checks a signed, revocation-checked Firebase session, the `admin: true` claim, and the user’s current role/disabled state. A route-group layout alone is not relied upon. Sessions expire after five days and use HTTP-only, SameSite=Strict, production-secure cookies. Session creation requires a recently authenticated ID token. All mutations enforce same origin. Uploads separately require an admin Firebase ID token in Storage rules.

Firestore rules allow public queries only for active products and intentional public site documents. Unauthenticated and ordinary authenticated writes are denied. Storage checks admin claims, content type and size; product SDK reads require publication. `site/settings` is public configuration, including the business contact number; it must never contain secrets.

Firebase token download URLs are shareable bearer links and can remain usable after a product is made inactive. Do not upload confidential material to this marketing-media bucket. Inactivation removes product pages and database access; deleting the asset revokes availability at that URL. If private draft assets become a requirement, replace token URLs with an authenticated media gateway or short-lived signed URLs.

The Admin SDK bypasses Firebase rules by design, so server endpoints separately verify authorization and validate all input. The emulator suite tests the rules independently. The app stores no customer accounts, cart, addresses or payments, and does not send WhatsApp messages automatically.

### Animation and media performance

Motion for React supplies viewport reveals, gentle transform parallax, mobile navigation and brief page entrances. GSAP is omitted because this experience needs no pinned or tightly coordinated scroll timeline. Native scrolling, keyboard use and responsive content remain primary. Reduced-motion preferences simplify animations; data saving/slow connections and reduced motion suppress automatic hero downloads, with an explicit play option.

The hero poster is prioritized and layout space is reserved. After the poster loads, a single responsive video source is selected; mobile does not download the desktop variant when a mobile file exists. Videos use no preload, silent inline autoplay, graceful poster fallback, an accessible pause/play button and pause when hidden/offscreen. Product films load only near the viewport and require user playback. Images use Next Image responsive sizing and lazy loading.

The supplied 20-second H.264 film was optimized from about 20.3 MiB to approximately 2.6 MiB desktop and 1.3 MiB mobile, with audio removed and `faststart` enabled. Originals remain untouched in `assets/`. The temporary processing tool is not an application dependency.

To process a replacement with FFmpeg:

```sh
ffmpeg -i input.mp4 -an -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p -movflags +faststart desktop.mp4
ffmpeg -i input.mp4 -an -vf 'crop=ih*9/16:ih,scale=540:960' -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart mobile.mp4
```

Review the crop before publishing. Firebase Storage does not transcode. The UI consumes the provider-neutral `MediaAsset` model; a future Mux/Cloudinary integration can replace upload/delivery adapters and URL validation without changing page layouts. Add any new trusted image hosts to `next.config.ts` explicitly.

## Quality checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

The browser suite starts the production server after a successful build and checks desktop/mobile film playback, navigation, reduced-motion/data-saving behavior, unauthorized admin requests, and SEO routes. Install Chromium once with `npx playwright install chromium`. Set `TEST_BASE_URL` to test an already-running server, or `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to use an existing Chrome installation.

Security rule tests need Java 21+ and the Firebase emulators:

```sh
npm run test:rules
```

Run `npm run test:workflows` after building to exercise admin product creation/editing, publication, size selection, sold-out states and WhatsApp messages in the browser against local Auth/Firestore/Storage emulators. It uses the same Java and browser prerequisites. The fixture product exists only in the demo emulator, and is removed after the test.

These suites use the isolated `demo-anizo` project, never production data. Tests cover anonymous/customer write rejection, draft read restrictions, admin authorization, invalid file types and sizes, discount calculations and URL encoding.

## Deploy

The production deployment uses Firebase App Hosting backend `anizo-store` in `asia-southeast1`. A static export cannot run secure sessions or server-rendered Firestore reads.

Deploy the current source with:

```sh
firebase deploy --only apphosting:anizo-store
```

Production variables and scaling are defined in `apphosting.yaml`. App Hosting supplies application-default server credentials, so the local service-account key is never uploaded. Deploy Firestore or Storage rules separately whenever their files change.

After each release, verify the homepage and `/admin/login`. Add confirmed products through the admin, review the privacy copy against actual business operations, and configure billing alerts in the Firebase console.

### References

- [Firebase custom claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Firebase session cookies](https://firebase.google.com/docs/auth/admin/manage-cookies)
- [WhatsApp click to chat](https://faq.whatsapp.com/5913398998672934)
- [Motion reduced-motion support](https://motion.dev/docs/react-use-reduced-motion)

The ANIZO Firebase project, production App Hosting backend, and local environment are configured. The owner’s WhatsApp number is saved in Firestore. Private local credentials remain in the ignored `.secrets.nosync` directory and are not deployed. Product details should be entered through the admin panel. See [Firebase setup status](docs/firebase-setup.md) for the live URL and remaining business content.
