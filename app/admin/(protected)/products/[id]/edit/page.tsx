import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getProductById } from "@/lib/firestore";
import { ProductForm } from "@/components/admin/product-form";
export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) { await requireAdmin(); const { id } = await params; if (!/^[\w-]{1,100}$/.test(id)) notFound(); const product = await getProductById(id); if (!product) notFound(); return <ProductForm key={product.updatedAt} id={id} product={product} />; }
