import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdmin, isServerConfigured } from "./firebase-admin";

export const SESSION_COOKIE = "anizo_session";
export class AuthError extends Error {}

export const getAdminSession = cache(async () => {
  if (!isServerConfigured) return null;
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const { auth } = getAdmin();
    const decoded = await auth.verifySessionCookie(cookie, true);
    if (decoded.admin !== true) return null;
    const user = await auth.getUser(decoded.uid);
    if (user.disabled || user.customClaims?.admin !== true) return null;
    return { uid: decoded.uid, email: user.email || "Administrator" };
  } catch { return null; }
});

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function requireApiAdmin() {
  const session = await getAdminSession();
  if (!session) throw new AuthError("Your admin session has expired. Sign in again.");
  return session;
}

export function verifyOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const configuredUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const expected = configuredUrl ? new URL(configuredUrl).origin : new URL(request.url).origin;
  if (!origin || origin !== expected) throw new AuthError("Request origin was rejected.");
}
