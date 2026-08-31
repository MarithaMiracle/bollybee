import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import {
  getFeaturedProducts,
  getBestsellers,
  getNewArrivals,
  getCategories,
  getGiftSets,
} from "@/lib/data/products";
import { getHeroContent } from "@/lib/data/site";
import { TrustMarquee } from "@/components/layout/trust-marquee";
import { FRAGRANCE_FAMILIES, fragranceFamilyLabel } from "@/lib/utils";

export default async function HomePage() {
  const [featured, bestsellers, newArrivals, categories, giftSets, hero] =
    await Promise.all([
      getFeaturedProducts(4),
      getBestsellers(4),
      getNewArrivals(4),
      getCategories(),
      getGiftSets(),
      getHeroContent(),
    ]);

  const shopCategories = categories.filter((c) =>
    !["gift-sets", "sample-packs"].includes(c.slug)
  );

  return (
    <>
      {/* Hero — full-bleed background, copy on the left */}
      <section className="relative min-h-[520px] overflow-hidden md:min-h-[600px] lg:min-h-[680px]">
        {hero?.image_url ? (
          <Image
            src={hero.image_url}
            alt={hero.alt_text ?? "Bollybee fragrance bottle on blush silk"}
            fill
            className="object-cover object-[72%_center] md:object-right"
            priority
            sizes="100vw"
            quality={90}
          />
        ) : (
          <div className="absolute inset-0 bg-[var(--surface)]" />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[var(--background)] via-[var(--background)]/75 to-[var(--background)]/10 md:from-[var(--background)]/95 md:via-[var(--background)]/55 md:to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto flex min-h-[520px] max-w-7xl items-center px-4 py-20 md:min-h-[600px] md:px-8 md:py-32 lg:min-h-[680px]">
          <div className="animate-fade-up max-w-xl space-y-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
              Bollybee Fragrance Lab
            </p>
            <h1 className="font-display text-4xl leading-tight tracking-wide md:text-6xl lg:text-7xl">
              Soft luxury,
              <br />
              <em className="text-[var(--plum)]">bottled.</em>
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-[var(--muted-foreground)] md:text-base">
              Premium fragrances crafted for the modern Nigerian. Discover signature
              scents that move with confidence and warmth.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/shop">Shop Fragrances</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/sample-packs">Try Sample Packs</Link>
              </Button>
            </div>
          </div>
        </div>
        <TrustMarquee />
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">Curated</p>
              <h2 className="font-display text-3xl md:text-4xl">Featured Fragrances</h2>
            </div>
            <Link href="/shop" className="text-xs uppercase tracking-[0.18em] text-[var(--plum)] hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {shopCategories.length > 0 && (
        <section className="bg-[var(--surface)] py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <h2 className="mb-10 text-center font-display text-3xl md:text-4xl">Shop by Category</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {shopCategories.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop/${cat.slug}`}
                  className="group relative aspect-[4/5] overflow-hidden border border-[var(--border)] bg-[var(--surface)]"
                >
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width:768px) 50vw, 25vw"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <span className="absolute bottom-0 left-0 right-0 p-4 font-display text-lg tracking-wide text-white line-clamp-2">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Fragrance families */}
      <section className="bg-black py-16 text-white md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-10 text-center font-display text-3xl">Explore by Family</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {FRAGRANCE_FAMILIES.map((family) => (
              <Link
                key={family}
                href={`/shop?family=${family.toLowerCase()}`}
                className="border border-white/30 px-5 py-2.5 text-xs uppercase tracking-[0.16em] transition-colors hover:border-white hover:bg-white hover:text-black"
              >
                {fragranceFamilyLabel(family)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best sellers & New */}
      <section className="bg-[var(--surface)] py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          {bestsellers.length > 0 && (
            <>
              <h2 className="mb-10 font-display text-3xl">Best Sellers</h2>
              <div className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {bestsellers.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}
          {newArrivals.length > 0 && (
            <>
              <h2 className="mb-10 font-display text-3xl">New Arrivals</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {newArrivals.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Gift sets */}
      {giftSets.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <h2 className="mb-10 font-display text-3xl">Gift Sets</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {giftSets.slice(0, 3).map((gs) => (
              <Link
                key={gs.id}
                href={`/gift-sets#${gs.slug}`}
                className="group overflow-hidden border border-[var(--border)] bg-white transition-shadow hover:shadow-md"
              >
                {gs.image_url && (
                  <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface)]">
                    <Image
                      src={gs.image_url}
                      alt={gs.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width:768px) 100vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-display text-xl">{gs.name}</h3>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)] line-clamp-2">
                    {gs.description}
                  </p>
                  <p className="mt-4 font-medium">₦{gs.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Brand story */}
      <section className="border-y border-[var(--border)] bg-white py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Our Story</p>
          <h2 className="mt-4 font-display text-3xl md:text-5xl">Born from a passion for scent</h2>
          <p className="mt-6 text-sm leading-relaxed text-[var(--muted-foreground)] md:text-base">
            Bollybee was created to bring soft luxury fragrance to Nigeria. Every bottle
            is composed with imported oils, crafted for lasting wear, and designed to
            express the warmth and confidence of modern African identity.
          </p>
          <Button asChild variant="outline" className="mt-8">
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <h2 className="mb-10 text-center font-display text-3xl">What Our Customers Say</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { quote: "Velvet Amber is my signature scent. Warm, elegant, and it lasts all day.", author: "Adaeze O.", location: "Lagos" },
            { quote: "The sample pack helped me find my perfect fragrance without commitment.", author: "Tunde M.", location: "Abuja" },
            { quote: "Beautiful packaging and even more beautiful scents. Bollybee delivers.", author: "Chioma A.", location: "Port Harcourt" },
          ].map((t) => (
            <blockquote key={t.author} className="border border-[var(--border)] p-6">
              <p className="font-display text-lg italic leading-relaxed text-[var(--plum)]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-4 text-xs text-[var(--muted)]">
                {t.author} · {t.location}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[var(--plum)] py-16 text-white md:py-20">
        <div className="mx-auto max-w-xl px-4 text-center md:px-8">
          <h2 className="font-display text-3xl">Join the Bollybee Circle</h2>
          <p className="mt-3 text-sm text-white/70">
            Be first to know about new releases, exclusive offers, and fragrance tips.
          </p>
          <div className="mt-8">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
