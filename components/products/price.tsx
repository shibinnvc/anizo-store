import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";

export function Price({ product, large = false }: { product: Product; large?: boolean }) {
  const discounted = product.discountedPrice < product.originalPrice;
  return <div className={`product-price ${large ? "large" : ""}`}><span className="sr-only">Selling price </span><span>{formatPrice(product.discountedPrice, product.currency)}</span>{discounted && <><span className="sr-only">Original price </span><del>{formatPrice(product.originalPrice, product.currency)}</del></>}</div>;
}

export function DiscountBadge({ product }: { product: Product }) {
  if (product.discountedPrice >= product.originalPrice) return null;
  return <span className="discount-badge">{product.discountType === "percentage" ? `${product.discountValue}% off` : `Save ${formatPrice(product.discountValue, product.currency)}`}</span>;
}
