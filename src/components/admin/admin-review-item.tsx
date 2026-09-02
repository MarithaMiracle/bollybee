"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { approveReview, deleteReview } from "@/actions/reviews";
import { AdminBadge } from "@/components/admin/admin-badge";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-provider";
import { Star } from "lucide-react";

interface AdminReviewItemProps {
  id: string;
  productName: string;
  authorName: string;
  createdAt: string;
  rating: number;
  title: string | null;
  body: string;
  approved: boolean;
}

export function AdminReviewItem({
  id,
  productName,
  authorName,
  createdAt,
  rating,
  title,
  body,
  approved,
}: AdminReviewItemProps) {
  const confirm = useConfirm();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function runAction(action: () => Promise<unknown>, successMessage: string) {
    startTransition(async () => {
      await action();
      toast.success(successMessage);
      router.refresh();
    });
  }

  async function handleApprove() {
    runAction(() => approveReview(id), "Review approved");
  }

  async function handleReject() {
    const ok = await confirm({
      title: "Reject this review?",
      description: "The review will be permanently deleted and will not appear on the product page.",
      confirmLabel: "Reject review",
      variant: "destructive",
    });
    if (!ok) return;

    runAction(() => deleteReview(id), "Review rejected");
  }

  async function handleDelete() {
    const ok = await confirm({
      title: "Delete this review?",
      description: "This approved review will be permanently removed from the storefront.",
      confirmLabel: "Delete review",
      variant: "destructive",
    });
    if (!ok) return;

    runAction(() => deleteReview(id), "Review deleted");
  }

  return (
    <li className="space-y-3 px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{productName}</p>
          <p className="text-xs text-[var(--muted)]">
            {authorName} · {createdAt}
          </p>
          <div className="mt-1 flex">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`h-3.5 w-3.5 ${n <= rating ? "fill-[var(--plum)] text-[var(--plum)]" : "text-[var(--border)]"}`}
              />
            ))}
          </div>
        </div>
        <AdminBadge label={approved ? "APPROVED" : "PENDING"} />
      </div>
      {title && <p className="font-display text-base">{title}</p>}
      <p className={`text-sm text-[var(--muted-foreground)] ${approved ? "line-clamp-2" : ""}`}>
        {body}
      </p>
      <div className="flex flex-wrap gap-2">
        {!approved ? (
          <>
            <Button type="button" size="sm" onClick={handleApprove} disabled={pending}>
              Approve
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleReject} disabled={pending}>
              Reject
            </Button>
          </>
        ) : (
          <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={pending}>
            Delete
          </Button>
        )}
      </div>
    </li>
  );
}
