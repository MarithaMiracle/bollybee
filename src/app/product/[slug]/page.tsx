import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductJsonLd } from "@/components/product/product-jsonld";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const minPrice = Math.min(...(product.variations?.map((v) => v.price) ?? [0]));

  return (
    <>
      <ProductJsonLd product={product} minPrice={minPrice} />
      <ProductDetail product={product} related={related} />
    </>
  );
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.short_description || product.description,
    openGraph: {
      title: product.name,
      description: product.short_description || undefined,
    },
  };
}
