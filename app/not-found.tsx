import Link from "next/link";
export default function NotFound() { return <div className="error-screen"><span className="eyebrow">ANIZO / 404</span><h1>A little off the scent.</h1><p>The page you’re looking for isn’t here.</p><Link href="/" className="button button-dark">Back to ANIZO</Link></div>; }
