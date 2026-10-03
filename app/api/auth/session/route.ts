import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdmin } from "@/lib/firebase-admin";
import { AuthError, SESSION_COOKIE, verifyOrigin } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";

export async function POST(request: Request) {
  try {
    verifyOrigin(request);
    const { idToken } = await readJson(request);
    if (typeof idToken !== "string" || idToken.length > 10000) throw new AuthError("Invalid sign-in token.");
    const { auth } = getAdmin();
    let decoded;
    try { decoded = await auth.verifyIdToken(idToken, true); } catch { throw new AuthError("Sign-in expired. Please sign in again."); }
    const user = await auth.getUser(decoded.uid);
    if (decoded.admin !== true || user.customClaims?.admin !== true || user.disabled) throw new AuthError("This account does not have administrator access.");
    if (Math.floor(Date.now() / 1000) - decoded.auth_time > 300) throw new AuthError("Please sign in again to start a secure session.");
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const session = await auth.createSessionCookie(idToken, { expiresIn });
    (await cookies()).set(SESSION_COOKIE, session, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: expiresIn / 1000 });
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: Request) {
  try {
    verifyOrigin(request);
    (await cookies()).set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
