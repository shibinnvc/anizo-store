"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserLocalPersistence, setPersistence, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirebase, isFirebaseConfigured } from "@/lib/firebase";
import { adminFetch } from "@/lib/client-api";
import { Arrow } from "@/components/ui/icons";

export function LoginForm({ serverReady }: { serverReady: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ready = serverReady && isFirebaseConfigured;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const { auth } = getFirebase();
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithEmailAndPassword(auth, String(form.get("email")), String(form.get("password")));
      const token = await result.user.getIdTokenResult(true);
      if (token.claims.admin !== true) { await signOut(auth); throw new Error("This account does not have administrator access."); }
      await adminFetch("/api/auth/session", "POST", { idToken: token.token });
      router.replace("/admin"); router.refresh();
    } catch (error) {
      const code = (error as { code?: string }).code;
      setError(code?.startsWith("auth/") ? code === "auth/too-many-requests" ? "Too many attempts. Please wait before trying again." : "Unable to sign in. Check your email and password and try again." : error instanceof Error ? error.message : "Sign-in failed. Please try again.");
      setBusy(false);
    }
  }
  return <form onSubmit={submit} className="login-form">{!ready && <div className="form-notice">Connect your Firebase project to enable secure sign-in. Follow the setup steps in README.md and restart the application.</div>}<label className="field"><span>Email address</span><input name="email" type="email" autoComplete="username" required placeholder="you@yourbrand.com" disabled={!ready || busy} /></label><label className="field"><span>Password</span><input name="password" type="password" autoComplete="current-password" required minLength={6} disabled={!ready || busy} placeholder="Your password" /></label>{error && <p role="alert" className="form-error">{error}</p>}<button className="button button-dark" disabled={busy || !ready}>{busy ? "Signing in…" : "Sign in to your studio"}<Arrow /></button><p className="login-help">Access is reserved for authorized administrators.<br />Contact your project owner if you need access.</p></form>;
}
