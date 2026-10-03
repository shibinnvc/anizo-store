"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="error-screen"><span className="eyebrow">ANIZO</span><h1>A brief pause.</h1><p>We couldn’t load this page. Please try again in a moment.</p><button className="button button-dark" onClick={reset}>Try again</button><Link href="/" className="text-link">Return home</Link></div>;
}
