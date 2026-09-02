"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pagination } from "@/components/ui/pagination";
import { submitReview } from "@/actions/reviews";
import { StarRating, StarRatingInput } from "@/components/product/star-rating";
import { buildPageHref, REVIEWS_PAGE_SIZE } from "@/lib/pagination";

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
  totalReviews: number;
  reviewPage: number;
  reviewAverage: number | null;
  isLoggedIn: boolean;
}

export function ProductReviews({
  productId,
  productSlug,
  reviews,
  totalReviews,
  reviewPage,
  reviewAverage,
  isLoggedIn,
}: ProductReviewsProps) {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Please select a star rating");
      return;
    }
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
      setRating(0);
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <section className="mt-12 md:mt-20">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl">Reviews</h2>
          {reviewAverage !== null && totalReviews > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StarRating rating={reviewAverage} size="md" />
              <p className="text-sm text-[var(--muted-foreground)]">
                {reviewAverage.toFixed(1)} out of 5 · {totalReviews} review
                {totalReviews !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
        {isLoggedIn && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Write a review"}
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 max-w-lg space-y-4 brand-panel bg-white p-6">
          <div>
            <Label>Rating</Label>
            <div className="mt-2">
              <StarRatingInput value={rating} onChange={setRating} />
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
          <a href="/account/login" className="text-[var(--plum)] underline">
            Sign in
          </a>{" "}
          to leave a review.
        </p>
      )}

      {totalReviews === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">No reviews yet. Be the first!</p>
      ) : (
        <>
          <ul className="brand-panel divide-y divide-[var(--border)] bg-white">
            {reviews.map((r) => (
              <li key={r.id} className="p-5">
                <div className="flex items-center gap-2">
                  <StarRating rating={r.rating} />
                  <span className="text-sm font-medium">{r.author_name}</span>
                </div>
                {r.title && <p className="mt-2 break-words font-display text-base sm:text-lg">{r.title}</p>}
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {r.body}
                </p>
              </li>
            ))}
          </ul>
          <Pagination
            page={reviewPage}
            total={totalReviews}
            limit={REVIEWS_PAGE_SIZE}
            buildHref={(p) =>
              buildPageHref(`/product/${productSlug}`, p, undefined, "reviewPage")
            }
          />
        </>
      )}
    </section>
  );
}
