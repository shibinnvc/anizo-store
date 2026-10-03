import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getProducts } from "@/lib/firestore";
import { ProductTable } from "@/components/admin/product-table";
import { Plus, Arrow } from "@/components/ui/icons";

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ after?: string }> }) {
  await requireAdmin();
  const { after } = await searchParams;
  const { products, nextCursor } = await getProducts({ admin: true, cursor: typeof after === "string" && /^[\w-]{1,100}$/.test(after) ? after : undefined, limit: 25 });
  return <><div className="admin-page-heading"><div><span className="eyebrow">THE COLLECTION</span><h1>Your fragrances.</h1><p>Manage products, prices and the details that make them personal.</p></div><Link href="/admin/products/new" className="button button-dark"><Plus />Add product</Link></div><section className="admin-panel no-padding">{products.length ? <ProductTable products={products} /> : <div className="admin-empty"><span className="empty-symbol">◈</span><h2>{after ? "You’ve reached the end." : "Your collection starts here."}</h2><p>{after ? "Return to the first page to see your products." : "Add your first fragrance, upload its images and publish when you’re ready."}</p><Link href={after ? "/admin/products" : "/admin/products/new"} className="button button-dark">{after ? "Back to products" : "Add your first product"}<Arrow /></Link></div>}</section><div className="pagination">{after && <Link className="text-link" href="/admin/products">First page</Link>}{nextCursor && <Link className="button button-outline" href={`/admin/products?after=${encodeURIComponent(nextCursor)}`}>Next page <Arrow /></Link>}</div></>;
}
