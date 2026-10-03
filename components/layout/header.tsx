"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import { Logo } from "./logo";
import { Arrow, Close } from "@/components/ui/icons";
import type { SiteSettings } from "@/types/site";

const links = [{ href: "/#collection", label: "The collection" }, { href: "/#our-world", label: "Our world" }, { href: "/#philosophy", label: "The philosophy" }];

export function Header({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const dark = pathname !== "/" || scrolled || open;

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40);
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    if (open) { dialog.current?.showModal(); document.body.style.overflow = "hidden"; }
    else { dialog.current?.close(); document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function closeMenu() { setOpen(false); menuButton.current?.focus(); }

  return <>
    <header className={`site-header ${dark ? "solid" : "over-hero"}`}>
      <Link className="logo-link" href="/" aria-label={`${settings.brandName} home`}><Logo light={!dark} asset={settings.logo} brandName={settings.brandName} /></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{links.map(link => <Link key={link.href} href={link.href} className="nav-link">{link.label}</Link>)}</nav>
      <Link href="/#contact" className="header-contact">Find your signature <Arrow diagonal /></Link>
      <button ref={menuButton} className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" aria-label="Open navigation" onClick={() => setOpen(true)}><span /><span /></button>
    </header>
    <dialog ref={dialog} id="mobile-navigation" className="mobile-menu" onCancel={() => setOpen(false)} aria-label="Main navigation">
      <div className="mobile-menu-top"><Link href="/" onClick={closeMenu}><Logo asset={settings.logo} brandName={settings.brandName} /></Link><button className="icon-button" onClick={closeMenu} aria-label="Close navigation"><Close /></button></div>
      <AnimatePresence>{open && <m.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }} aria-label="Mobile navigation">{[...links, { href: "/#contact", label: "Let’s talk" }].map((link, i) => <m.div key={link.href} initial={{ y: 25, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}><Link href={link.href} onClick={closeMenu}><span className="eyebrow">0{i + 1}</span>{link.label}<Arrow diagonal /></Link></m.div>)}</m.nav>}</AnimatePresence>
      <p className="mobile-menu-footer">{settings.tagline}</p>
    </dialog>
  </>;
}
