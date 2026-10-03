import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { isServerConfigured } from "@/lib/firebase-admin";
import { Logo } from "@/components/layout/logo";
import { LoginForm } from "@/components/admin/login-form";

export default async function LoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return <main className="admin-login"><div className="login-visual"><Image src="/media/campaign-ritual.jpg" alt="ANIZO fragrance campaign" fill sizes="50vw" className="object-cover" /><div><Logo light /><p>A presence<br /><em>beyond words.</em></p><span className="eyebrow">THE ANIZO BRAND STUDIO</span></div></div><div className="login-panel"><Link href="/" className="login-back">← Back to website</Link><div className="login-content"><span className="eyebrow">WELCOME TO YOUR STUDIO</span><h1>Behind the brand.</h1><p className="login-intro">A considered space to manage your fragrances,<br />your stories, and your world.</p><LoginForm serverReady={isServerConfigured} /></div><span className="login-copyright">ANIZO · Authorized access only</span></div></main>;
}
