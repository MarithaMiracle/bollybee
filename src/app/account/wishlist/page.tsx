import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WishlistItemCard } from "@/components/account/wishlist-item-card";
import { Pagination } from "@/components/ui/pagination";
import {
  ACCOUNT_WISHLIST_PAGE_SIZE,
  buildPageHref,
  pageRange,
  parsePage,
} from "@/lib/pagination";

type WishlistProduct = {
  id: string;
  name: string;
  slug: string;
  images?: { image_url: string; alt_text: string | null; sort_order: number }[];
  variations?: { price: number; active: boolean }[];
};

function parseWishlistProduct(value: unknown): WishlistProduct | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || typeof raw !== "object") return null;
  const p = raw as WishlistProduct;
  if (!p.id || !p.slug) return null;
  return p;
}

export const dynamic = "force-dynamic";

interface AccountWishlistPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AccountWishlistPage({ searchParams }: AccountWishlistPageProps) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const { from, to } = pageRange(page, ACCOUNT_WISHLIST_PAGE_SIZE);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account/login");

  const { data: items, count } = await supabase
    .from("wishlist_items")
    .select(
      `
      id,
      products (
        id, name, slug,
        images:product_images (image_url, alt_text, sort_order),
        variations:product_variations (price, active)
      )
    `,
      { count: "exact" }
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  const total = count ?? 0;

  return (
    <>
      <p className="text-sm text-[var(--muted-foreground)]">
        {total} item{total !== 1 ? "s" : ""} saved
      </p>

      {total === 0 ? (
        <div className="mt-8 rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--surface)]/50 px-6 py-12 text-center">
          <p className="text-[var(--muted-foreground)]">Your wishlist is empty.</p>
          <Link
            href="/shop"
            className="mt-4 inline-block text-sm text-[var(--plum)] underline-offset-4 hover:underline"
          >
            Browse the shop
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {items!.map((item) => {
              const product = parseWishlistProduct(item.products);
              if (!product) return null;
              const image = product.images?.sort((a, b) => a.sort_order - b.sort_order)[0];
              const minPrice = Math.min(
                ...(product.variations?.filter((v) => v.active).map((v) => v.price) ?? [0])
              );

              return (
                <WishlistItemCard
                  key={item.id}
                  itemId={item.id}
                  name={product.name}
                  slug={product.slug}
                  imageUrl={image?.image_url}
                  imageAlt={image?.alt_text}
                  minPrice={minPrice}
                />
              );
            })}
          </div>
          <Pagination
            page={page}
            total={total}
            limit={ACCOUNT_WISHLIST_PAGE_SIZE}
            buildHref={(p) => buildPageHref("/account/wishlist", p)}
          />
        </>
      )}
    </>
  );
}
