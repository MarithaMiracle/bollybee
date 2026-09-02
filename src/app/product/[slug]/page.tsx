import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductJsonLd } from "@/components/product/product-jsonld";
import { createClient } from "@/lib/supabase/server";
import { isInWishlist } from "@/actions/wishlist";
import { pageRange, parsePage, REVIEWS_PAGE_SIZE } from "@/lib/pagination";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ reviewPage?: string }>;
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const reviewPage = parsePage(sp.reviewPage);
  const { from, to } = pageRange(reviewPage, REVIEWS_PAGE_SIZE);

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [related, reviewsRes, reviewStatsRes, inWishlist] = await Promise.all([
    getRelatedProducts(product),
    supabase
      .from("product_reviews")
      .select("id, author_name, rating, title, body, created_at", { count: "exact" })
      .eq("product_id", product.id)
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase
      .from("product_reviews")
      .select("rating")
      .eq("product_id", product.id)
      .eq("approved", true),
    isInWishlist(product.id),
  ]);

  const totalReviews = reviewsRes.count ?? 0;
  const ratings = reviewStatsRes.data?.map((r) => r.rating) ?? [];
  const reviewAverage =
    ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : null;

  const minPrice = Math.min(...(product.variations?.map((v) => v.price) ?? [0]));

  return (
    <>
      <ProductJsonLd product={product} minPrice={minPrice} />
      <ProductDetail
        product={product}
        related={related}
        reviews={reviewsRes.data ?? []}
        totalReviews={totalReviews}
        reviewPage={reviewPage}
        reviewAverage={reviewAverage}
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
