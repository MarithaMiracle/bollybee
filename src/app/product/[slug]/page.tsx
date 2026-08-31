import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductJsonLd } from "@/components/product/product-jsonld";
import { createClient } from "@/lib/supabase/server";
import { isInWishlist } from "@/actions/wishlist";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [related, { data: reviews }, inWishlist] = await Promise.all([
    getRelatedProducts(product),
    supabase
      .from("product_reviews")
      .select("id, author_name, rating, title, body, created_at")
      .eq("product_id", product.id)
      .eq("approved", true)
      .order("created_at", { ascending: false }),
    isInWishlist(product.id),
  ]);

  const minPrice = Math.min(...(product.variations?.map((v) => v.price) ?? [0]));

  return (
    <>
      <ProductJsonLd product={product} minPrice={minPrice} />
      <ProductDetail
        product={product}
        related={related}
        reviews={reviews ?? []}
        isLoggedIn={Boolean(user)}
        inWishlist={inWishlist}
      />
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
