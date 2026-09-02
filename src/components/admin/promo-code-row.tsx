"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deletePromoCode, togglePromoCode } from "@/actions/promo";
import { AdminBadge } from "@/components/admin/admin-badge";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-provider";

interface PromoCodeRowProps {
  id: string;
  code: string;
  discountLabel: string;
  usageLabel: string;
  description: string | null;
  active: boolean;
}

export function PromoCodeRow({
  id,
  code,
  discountLabel,
  usageLabel,
  description,
  active,
}: PromoCodeRowProps) {
  const confirm = useConfirm();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function runAction(action: () => Promise<{ error?: string } | { success?: boolean }>, successMessage: string) {
    startTransition(async () => {
      const result = await action();
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(successMessage);
      router.refresh();
    });
  }

  async function handleToggle() {
    runAction(() => togglePromoCode(id, !active), active ? "Promo code deactivated" : "Promo code activated");
  }

  async function handleDelete() {
    const ok = await confirm({
      title: "Delete promo code?",
      description: `"${code}" will be permanently removed and can no longer be used at checkout.`,
      confirmLabel: "Delete code",
      variant: "destructive",
    });
    if (!ok) return;

    runAction(() => deletePromoCode(id), "Promo code deleted");
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
      <div>
        <p className="font-mono font-medium">{code}</p>
        <p className="text-xs text-[var(--muted)]">
          {discountLabel}
          {" · "}
          {usageLabel}
        </p>
        {description && (
          <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <AdminBadge label={active ? "ACTIVE" : "INACTIVE"} />
        <Button type="button" variant="outline" size="sm" onClick={handleToggle} disabled={pending}>
          {active ? "Deactivate" : "Activate"}
        </Button>
        <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={pending}>
          Delete
        </Button>
      </div>
    </li>
  );
}
