"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/types/product";
import { formatPrice, errorMessage } from "@/lib/utils";
import { adminFetch } from "@/lib/client-api";
import { ConfirmDialog } from "./confirm-dialog";
import { useFeedback } from "./feedback";

export function ProductTable({ products }: { products: Product[] }) {
  const [deleting, setDeleting] = useState<Product | null>(null);
  const router = useRouter();
  const notify = useFeedback();
  async function remove() {
    if (!deleting) return;
    try { const result = await adminFetch(`/api/admin/products/${deleting.id}`, "DELETE", { expectedUpdatedAt: deleting.updatedAt }); notify(result.warning || "Product deleted.", result.warning ? "info" : "success"); setDeleting(null); router.refresh(); }
    catch (error) { setDeleting(null); notify(errorMessage(error), "error"); }
  }
  return <><div className="table-scroll"><table className="admin-table"><thead><tr><th>Fragrance</th><th>Status</th><th>Price</th><th>Featured</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{products.map(product => <tr key={product.id}><td><Link className="table-product" href={`/admin/products/${product.id}/edit`}>{product.images[0] ? <Image src={product.images[0].url} alt="" width={52} height={64} className="object-cover" /> : <span className="table-image-empty">A</span>}<span><strong>{product.name}</strong><small>{product.size}</small></span></Link></td><td><span className={`status-label ${product.active ? "published" : "draft"}`}>{product.active ? "Active" : "Draft"}</span></td><td><span>{formatPrice(product.discountedPrice, product.currency)}</span>{product.discountedPrice < product.originalPrice && <del className="table-old-price">{formatPrice(product.originalPrice, product.currency)}</del>}</td><td>{product.featured ? "Yes" : "—"}</td><td><div className="table-actions"><Link href={`/admin/products/${product.id}/edit`}>Edit</Link><button className="delete-text" onClick={() => setDeleting(product)}>Delete</button></div></td></tr>)}</tbody></table></div>{deleting && <ConfirmDialog title={`Delete ${deleting.name}?`} description="This permanently removes the product and its uploaded media. Customers will no longer be able to view its page. This cannot be undone." onCancel={() => setDeleting(null)} onConfirm={remove} />}</>;
}
