"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitReview } from "@/actions/reviews";
import { Star } from "lucide-react";

export interface ProductReview {
  id: string;
  author_name: string;
  rating: number;
  title: string | null;
  body: string;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
  productSlug: string;
  reviews: ProductReview[];
  isLoggedIn: boolean;
}

export function ProductReviews({
  productId,
  productSlug,
  reviews,
  isLoggedIn,
}: ProductReviewsProps) {
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const avg =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("productId", productId);
    formData.set("productSlug", productSlug);
    formData.set("rating", String(rating));
    const result = await submitReview(formData);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message ?? "Review submitted");
      setShowForm(false);
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <section className="mt-12 md:mt-20">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl">Reviews</h2>
          {avg && (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {avg} out of 5 · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {isLoggedIn && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Write a review"}
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 max-w-lg space-y-4 border bg-white p-6">
          <div>
            <Label>Rating</Label>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n} stars`}
                >
                  <Star
                    className={`h-5 w-5 ${n <= rating ? "fill-[var(--plum)] text-[var(--plum)]" : "text-[var(--border)]"}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="title">Title (optional)</Label>
            <Input id="title" name="title" />
          </div>
          <div>
            <Label htmlFor="body">Your review</Label>
            <Textarea id="body" name="body" required rows={4} minLength={10} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting…" : "Submit review"}
          </Button>
        </form>
      )}

      {!isLoggedIn && (
        <p className="mb-6 text-sm text-[var(--muted-foreground)]">
          <a href="/account/login" className="text-[var(--plum)] underline">Sign in</a> to leave a review.
        </p>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">No reviews yet. Be the first!</p>
      ) : (
        <ul className="divide-y divide-[var(--border)] border border-[var(--border)] bg-white">
          {reviews.map((r) => (
            <li key={r.id} className="p-5">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-[var(--plum)] text-[var(--plum)]" : "text-[var(--border)]"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{r.author_name}</span>
              </div>
              {r.title && <p className="mt-2 font-display text-lg">{r.title}</p>}
              <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">{r.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
