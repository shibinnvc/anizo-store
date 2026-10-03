"use client";
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="admin-empty"><h1>We couldn’t load your studio.</h1><p>Check your connection and Firebase configuration, then try again.</p><button onClick={reset} className="button button-dark">Try again</button></div>; }
