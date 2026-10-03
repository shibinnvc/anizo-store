import "server-only";
import { applicationDefault, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Isolated demo projects on loopback emulators do not need a service-account key.
const usesEmulators = process.env.FIREBASE_PROJECT_ID?.startsWith("demo-") &&
  process.env.FIRESTORE_EMULATOR_HOST === "127.0.0.1:8080" &&
  process.env.FIREBASE_AUTH_EMULATOR_HOST === "127.0.0.1:9099";

export const isServerConfigured = Boolean(
  (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) &&
  (usesEmulators || (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) || process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.K_SERVICE),
);

export function getAdmin() {
  if (!isServerConfigured) throw new Error("Firebase server credentials are not configured.");
  const app = getApps().length ? getApp() : initializeApp({
    credential: process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
      ? cert({ projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") })
      : applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
  return { app, auth: getAuth(app), db: getFirestore(app), bucket: getStorage(app).bucket() };
}
