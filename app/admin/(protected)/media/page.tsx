import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAdmin } from "@/lib/firebase-admin";
import { MediaLibrary } from "@/components/admin/media-library";

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  await requireAdmin();
  const { token } = await searchParams;
  const [files, next] = await getAdmin().bucket.getFiles({ maxResults: 50, autoPaginate: false, ...(typeof token === "string" && token.length < 2000 ? { pageToken: token } : {}) });
  const media = files.filter(file => /^(hero|site|products)\//.test(file.name)).map(file => ({ path: file.name, name: file.name.split("/").pop() || file.name, size: Number(file.metadata.size || 0), type: file.metadata.contentType || "Unknown", created: file.metadata.timeCreated || "" }));
  return <><div className="admin-page-heading"><div><span className="eyebrow">A CONSIDERED LIBRARY</span><h1>Your media.</h1><p>Review uploads and remove unused files. Media in use is protected from deletion.</p></div></div><div className="form-notice">Upload images and films from Products, Hero management or Website settings. If you leave without saving, the uploaded files remain here for cleanup.</div><section className="admin-panel no-padding">{media.length ? <MediaLibrary files={media} /> : <div className="admin-empty"><h2>No uploaded media yet.</h2><p>Your supplied local brand assets remain available. Files uploaded through the studio will appear here.</p></div>}</section><div className="pagination">{token && <Link href="/admin/media" className="text-link">First page</Link>}{next?.pageToken && <Link href={`/admin/media?token=${encodeURIComponent(next.pageToken)}`} className="button button-outline">More files →</Link>}</div></>;
}
