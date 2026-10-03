"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { m, useReducedMotion } from "motion/react";
import type { HeroSettings } from "@/types/site";
import { Arrow } from "@/components/ui/icons";

type Connection = { saveData?: boolean; effectiveType?: string };

export function CinematicHero({ hero }: { hero: HeroSettings }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const reduced = useReducedMotion();
  const [source, setSource] = useState<string>();
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const userPaused = useRef(false);
  const canPlay = hero.enabled && Boolean(hero.video || hero.mobileVideo);

  const selectSource = useCallback(() => {
    const small = window.matchMedia("(max-width: 767px)").matches;
    return (small ? hero.mobileVideo || hero.video : hero.video || hero.mobileVideo)?.url;
  }, [hero.mobileVideo, hero.video]);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    if (!canPlay || reduced || connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || "")) return;
    let disposed = false;
    let timer: ReturnType<typeof setTimeout>;
    const load = () => { timer = setTimeout(() => { if (!disposed) setSource(selectSource()); }, 500); };
    const poster = posterRef.current;
    if (poster?.complete) load(); else poster?.addEventListener("load", load, { once: true });
    return () => { disposed = true; clearTimeout(timer); poster?.removeEventListener("load", load); };
  }, [canPlay, reduced, selectSource]);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video || !source) return;
    const update = (visible: boolean) => {
      if (visible && !document.hidden && !userPaused.current) video.play().catch(() => setPlaying(false));
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => update(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(section);
    const visibility = () => { const rect = section.getBoundingClientRect(); update(rect.bottom > 0 && rect.top < window.innerHeight); };
    document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, [source]);

  const toggle = () => {
    const video = videoRef.current;
    if (playing) { userPaused.current = true; video?.pause(); }
    else { userPaused.current = false; if (!source) setSource(selectSource()); else video?.play().catch(() => setPlaying(false)); }
  };

  return <section ref={sectionRef} className="cinematic-hero" aria-labelledby="hero-heading">
    <div className="hero-media"><Image ref={posterRef} src={hero.poster.url} alt={hero.poster.alt} fill preload sizes="100vw" className="hero-poster" />
      {canPlay && !failed && <video ref={videoRef} src={source} className={`hero-video ${ready ? "is-ready" : ""}`} poster={hero.poster.url} autoPlay muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} onPlaying={() => { setReady(true); setPlaying(true); }} onPause={() => setPlaying(false)} onError={() => { setFailed(true); setPlaying(false); }} />}
    </div>
    <div className="hero-shade" />
    <m.div className="hero-content" initial={{ opacity: 1 }} animate={{ opacity: [0.5, 1] }} transition={{ duration: 1.1 }}>
      <span className="eyebrow hero-eyebrow"><span className="tiny-line" />{hero.eyebrow}</span>
      <h1 id="hero-heading">{hero.heading.split("\n").map((line, i) => <span key={i} className={i === 1 ? "serif-italic" : ""}>{line}</span>)}</h1>
      <p>{hero.subtitle}</p>
      <Link href={hero.ctaUrl} className="button button-light">{hero.ctaText}<Arrow diagonal /></Link>
    </m.div>
    <div className="hero-bottom"><a href="#collection" className="hero-scroll"><span className="scroll-line" />SCROLL TO DISCOVER</a><span className="hero-caption">ANIZO — A PRESENCE BEYOND WORDS</span>{canPlay && !failed ? <button className="film-control" onClick={toggle} aria-label={playing ? "Pause campaign film" : "Play campaign film"}><span>{playing ? "Ⅱ" : "▷"}</span>{playing ? "PAUSE FILM" : "PLAY FILM"}</button> : <span className="eyebrow">THE CAMPAIGN</span>}</div>
  </section>;
}
