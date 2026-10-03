import type { SVGProps } from "react";

export function Arrow({ diagonal = false, ...props }: SVGProps<SVGSVGElement> & { diagonal?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true" {...props}>{diagonal ? <path d="M5 19 19 5M5 5h14v14" /> : <path d="M3 12h17m-7-7 7 7-7 7" />}</svg>;
}
export function Plus(props: SVGProps<SVGSVGElement>) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}><path d="M12 4v16M4 12h16" /></svg>; }
export function Close(props: SVGProps<SVGSVGElement>) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}><path d="m5 5 14 14M19 5 5 19" /></svg>; }
export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}><path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.5L3 20.5l1.4-5a8.4 8.4 0 1 1 16.1-3.9Z" /><path d="m8.2 7.4 1.4 2-1 1.3c.8 1.8 2 3 3.8 3.7l1.3-1 2 1.4c.4.3.4.8.1 1.2-.5.6-1.3.9-2 .7-3.8-.8-6.8-3.8-7.5-7.4-.2-.8.1-1.5.7-2 .4-.3.9-.2 1.2.1Z" /></svg>; }
