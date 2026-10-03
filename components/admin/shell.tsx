"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { Logo } from "@/components/layout/logo";
import { Arrow } from "@/components/ui/icons";
import { getFirebase } from "@/lib/firebase";
import { adminFetch } from "@/lib/client-api";
import { FeedbackProvider, useFeedback } from "./feedback";
import { errorMessage } from "@/lib/utils";

const navigation = [{ href: "/admin", label: "Overview", symbol: "◫" }, { href: "/admin/products", label: "Products", symbol: "◈" }, { href: "/admin/hero", label: "Hero management", symbol: "▷" }, { href: "/admin/media", label: "Media library", symbol: "▧" }, { href: "/admin/settings", label: "Website settings", symbol: "⚙" }];

function Shell({ children, email }: { children: React.ReactNode; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const notify = useFeedback();
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    try { await adminFetch("/api/auth/session", "DELETE"); await signOut(getFirebase().auth); router.replace("/admin/login"); router.refresh(); }
    catch (error) { notify(errorMessage(error), "error"); setBusy(false); }
  }
  return <div className="admin-shell"><aside className="admin-sidebar"><Link href="/admin" className="admin-brand"><Logo /><span>STUDIO</span></Link><span className="sidebar-label">YOUR WEBSITE</span><nav aria-label="Admin navigation">{navigation.map(item => <Link key={item.href} href={item.href} className={(item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href)) ? "active" : ""}><span aria-hidden="true">{item.symbol}</span>{item.label}</Link>)}</nav><div className="sidebar-bottom"><Link href="/" target="_blank" rel="noopener noreferrer">View website <Arrow diagonal width={15} height={15} /></Link><button onClick={logout} disabled={busy}>{busy ? "Signing out…" : "Sign out"}<Arrow width={15} height={15} /></button></div></aside><div className="admin-main"><header className="admin-topbar"><span>ANIZO / BRAND STUDIO</span><span className="admin-user"><span className="status-dot" />{email}</span></header><main className="admin-content" id="main-content">{children}</main></div></div>;
}
export function AdminShell(props: { children: React.ReactNode; email: string }) { return <FeedbackProvider><Shell {...props} /></FeedbackProvider>; }
