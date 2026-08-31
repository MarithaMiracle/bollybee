import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountNav } from "@/components/account/account-nav";
import { formatNaira } from "@/lib/utils";
import { ProductPlaceholder } from "@/components/product/product-placeholder";
import { relationName } from "@/lib/supabase/relation";

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

export default async function AccountWishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account/login");

  const { data: items } = await supabase
    .from("wishlist_items")
    .select(`
      id,
      products (
        id, name, slug,
        images:product_images (image_url, alt_text, sort_order),
        variations:product_variations (price, active)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <AccountNav active="/account/wishlist" />
      <h1 className="font-display text-3xl">Wishlist</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        {items?.length ?? 0} item{(items?.length ?? 0) !== 1 ? "s" : ""} saved
      </p>

      {!items?.length ? (
        <p className="mt-8 text-[var(--muted-foreground)]">
          Your wishlist is empty.{" "}
          <Link href="/shop" className="text-[var(--plum)] underline">Browse the shop</Link>
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const product = parseWishlistProduct(item.products);
            if (!product) return null;
            const image = product.images?.sort((a, b) => a.sort_order - b.sort_order)[0];
            const minPrice = Math.min(
              ...(product.variations?.filter((v) => v.active).map((v) => v.price) ?? [0])
            );

            return (
              <Link
                key={item.id}
                href={`/product/${product.slug}`}
                className="group overflow-hidden border border-[var(--border)] bg-white transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[3/4] bg-[var(--surface)]">
                  {image ? (
                    <Image
                      src={image.image_url}
                      alt={image.alt_text || product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width:768px) 50vw, 33vw"
                    />
                  ) : (
                    <ProductPlaceholder name={product.name} />
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-display text-lg">{product.name}</h2>
                  <p className="mt-1 text-sm font-medium">{formatNaira(minPrice)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
