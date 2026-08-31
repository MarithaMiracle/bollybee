import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSiteContent } from "@/lib/data/site";

export const metadata = { title: "About" };

const WHY_CHOOSE = [
  "Imported premium fragrance oils",
  "Nationwide delivery across all 36 states",
  "Secure payments via Paystack",
  "Dedicated customer support",
  "Easy order tracking",
] as const;

export default async function AboutPage() {
  const about = await getSiteContent("about");

  return (
    <div className="relative min-h-screen">
      {/* Full-page background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {about?.image_url ? (
          <Image
            src={about.image_url}
            alt=""
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
            quality={90}
          />
        ) : (
          <div className="h-full bg-[var(--surface)]" />
        )}
        <div
          className="absolute inset-0 bg-[var(--background)]/35"
          aria-hidden
        />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-20">
        <article className="space-y-12 border border-[var(--border)]/80 bg-[var(--background)]/94 p-6 shadow-sm backdrop-blur-md sm:p-8 md:p-12">
          <header className="text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Our Story</p>
            <h1 className="mt-4 font-display text-4xl md:text-5xl">About Bollybee</h1>
          </header>

          <div className="space-y-4 text-sm leading-relaxed text-[var(--muted-foreground)] md:text-base">
            <p>
              Bollybee Fragrance Lab was born from a passion for scent, confidence, and
              self-expression. We believe every person deserves to feel luxurious and empowered
              — and it starts with a fragrance that lingers beautifully.
            </p>
            <p>
              Our perfumes are crafted with imported premium oils, carefully blended for
              long-lasting wear and distinctive character. From warm orientals to fresh florals,
              our collection caters to every mood and occasion.
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl">Our Mission</h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)] md:text-base">
              To provide world-class fragrances that empower people across Nigeria and
              beyond to express their unique identity with confidence. We are committed to
              quality, accessibility, and an exceptional shopping experience.
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl">Why Choose Us</h2>
            <ul className="mt-6 space-y-4">
              {WHY_CHOOSE.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm md:text-base">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--plum)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button asChild size="lg">
            <Link href="/shop">Shop Fragrances</Link>
          </Button>
        </article>
      </div>
    </div>
  );
}
