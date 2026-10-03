# ANIZO Firebase setup

Project: [`anizo-fragrances-2026`](https://console.firebase.google.com/project/anizo-fragrances-2026/overview), created under `shibincrt10@gmail.com`.

- Web app: `ANIZO Storefront` (`1:1014652450303:web:725c3ee9421c580b78e3ca`).
- Production: [ANIZO App Hosting](https://anizo-store--anizo-fragrances-2026.asia-southeast1.hosted.app) is deployed from local source through the `anizo-store` backend in `asia-southeast1` (Singapore). The hosted domain is authorized for Firebase Authentication.
- Firestore: default database in `asia-south1` (Mumbai), with security rules and indexes deployed.
- Brand content: `site/settings` and `site/hero` are initialized with the supplied local media. WhatsApp is set to `+919946120506`.
- Authentication: email/password sign-in is enabled. The first administrator is `shibincrt10@gmail.com`, with the `admin` custom claim applied.
- Storage: the default bucket is `anizo-fragrances-2026.firebasestorage.app` in `ASIA-SOUTH1` (Mumbai). Storage rules are deployed and the supplied brand media has been moved into the bucket.
- Server access: the `anizo-web` service account has Firebase Auth administration, Firestore data access, and Storage object management roles. Its key is in `.secrets.nosync/firebase-admin.json`, readable only by the local user. `.env.local` references it and contains the web app configuration. Both are ignored by Git.
- Admin credentials: the temporary first-login details are in `.secrets.nosync/admin-login.txt`, readable only by the local user. Change the password after the first sign-in.
- Products: none created; enter confirmed details in the admin panel.

## Current status

Blaze billing is active. Firestore, Authentication, Storage, the owner administrator, security rules, server credentials, brand settings, and brand media are configured.

The production homepage, collection empty state, security headers, and owner admin sign-in have been verified in a real browser. Future source releases can be deployed with `firebase deploy --only apphosting:anizo-store`.

The live project intentionally has no products. Sign in to `/admin` and enter confirmed product details, prices, imagery, and availability there. The full admin/product workflow can also be verified without live writes using `npm run test:workflows` and the local Firebase emulators.

## Pending business content

- Change the temporary owner password stored in `.secrets.nosync/admin-login.txt`.
- Add and publish confirmed products through `/admin/products`.
- Add a contact email, Instagram profile, and custom logo in Website settings if desired. These optional fields are currently blank.
- Connect the final custom domain when it is available. The Firebase `hosted.app` address is the current production URL.

References: [Storage billing requirement](https://firebase.google.com/docs/storage/web/start), [Firebase console](https://console.firebase.google.com/project/anizo-fragrances-2026/usage/details).
