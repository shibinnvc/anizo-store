import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/auth";
import { ProductForm } from "@/components/admin/product-form";
export default async function NewProduct() { await requireAdmin(); return <ProductForm id={randomUUID()} />; }
