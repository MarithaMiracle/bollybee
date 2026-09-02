import { getSamplePacks } from "@/lib/data/products";
import { GiftSetCard } from "@/components/product/gift-set-card";
import { BackLink } from "@/components/layout/back-link";

export const metadata = { title: "Sample Packs" };
export const revalidate = 60;

export default async function SamplePacksPage() {
  const packs = await getSamplePacks();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <BackLink href="/shop" label="Back to shop" className="mb-6" />
      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl">Sample Packs</h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--muted-foreground)]">
        Discover your signature scent with our curated sample collections. Low
        commitment, high discovery.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packs.map((pack) => (
          <GiftSetCard
            key={pack.id}
            id={pack.id}
            name={pack.name}
            slug={pack.slug}
            description={pack.description}
            price={pack.price}
            imageUrl={pack.image_url}
            variant="sample-pack"
          />
        ))}
      </div>
    </div>
  );
}
