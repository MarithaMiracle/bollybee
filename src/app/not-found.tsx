import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-4xl">Page not found</h1>
      <p className="mt-4 text-[var(--muted-foreground)]">
        The page you are looking for does not exist.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
