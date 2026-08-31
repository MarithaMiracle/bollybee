import { getGiftSets } from "@/lib/data/products";
import { GiftSetCard } from "@/components/product/gift-set-card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gift Sets" };

export default async function GiftSetsPage() {
  const sets = await getGiftSets();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <h1 className="font-display text-4xl md:text-5xl">Gift Sets</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Curated fragrance collections, beautifully packaged.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sets.map((gs) => (
          <GiftSetCard
            key={gs.id}
            id={gs.id}
            name={gs.name}
            slug={gs.slug}
            description={gs.description}
            price={gs.price}
          />
        ))}
      </div>
    </div>
  );
}
