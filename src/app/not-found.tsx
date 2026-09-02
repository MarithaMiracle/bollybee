import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionDivider } from "@/components/layout/filigree-divider";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-[var(--satin-light)] px-4 py-16 sm:min-h-[75vh] sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--blush)_0%,_transparent_70%)] opacity-60"
        aria-hidden
      />

      <div className="animate-fade-up relative mx-auto w-full max-w-lg text-center">
        

        <p
          className="mt-6 font-display text-[7rem] leading-none tracking-tight text-[var(--plum)]/15 sm:text-[9rem]"
          aria-hidden
        >
          404
        </p>

        <h1 className="-mt-10 font-display text-3xl sm:text-4xl md:text-5xl">
          This page has <em className="text-[var(--plum)]">evaporated.</em>
        </h1>

        <p className="mt-5 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
          We followed the scent trail, through the entire shop, even past the sample packs, and found nothing.
          Whatever you were looking for, it&apos;s no longer on the bottle.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/shop">Shop Fragrances</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        <p className="mt-8 text-xs text-[var(--muted)]">
          Try{" "}
          <Link href="/sample-packs" className="text-[var(--plum)] underline-offset-4 hover:underline">
            sample packs
          </Link>
          ,{" "}
          <Link href="/track-order" className="text-[var(--plum)] underline-offset-4 hover:underline">
            track an order
          </Link>
          , or{" "}
          <Link href="/contact" className="text-[var(--plum)] underline-offset-4 hover:underline">
            ask us nicely
          </Link>
          .
        </p>
      </div>

      <SectionDivider className="relative mt-16 w-full max-w-xs opacity-50" />
    </div>
  );
}
