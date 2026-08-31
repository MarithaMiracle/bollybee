import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-8 md:py-24">
      <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">About Bollybee</p>
      <h1 className="mt-4 font-display text-4xl md:text-5xl">Soft luxury, bottled.</h1>
      <p className="mt-6 text-sm leading-relaxed text-[var(--muted-foreground)] md:text-base">
        Bollybee Fragrance Lab was born from a passion for scent, confidence, and self-expression.
        We believe every person deserves to feel luxurious and empowered — and it starts with
        a fragrance that lingers beautifully.
      </p>

      <div className="my-16 grid gap-10 md:grid-cols-2 md:items-center">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src="/brand/bollybee-shopping-bag.jpeg"
            alt="Bollybee branded shopping experience"
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 50vw"
          />
        </div>
        <div className="space-y-6">
          <h2 className="font-display text-2xl">Our Mission</h2>
          <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
            To provide world-class fragrances that empower people across Nigeria to express
            their unique identity with confidence. Quality, accessibility, and an exceptional
            experience — every time.
          </p>
          <ul className="space-y-3 text-sm">
            {["Imported premium oils", "Nationwide delivery", "Secure Paystack payments", "Dedicated support"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[var(--plum)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Button asChild variant="outline">
        <Link href="/shop">Explore Fragrances</Link>
      </Button>
    </div>
  );
}
