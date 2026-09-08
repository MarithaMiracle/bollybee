"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteVariation, updateVariation } from "@/actions/admin-products";
import { VariationFields } from "@/components/admin/variation-fields";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-provider";
import type { ProductVariation } from "@/types";

interface VariationRowProps {
  productId: string;
  variation: ProductVariation;
}

export function VariationRow({ productId, variation }: VariationRowProps) {
  const confirm = useConfirm();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateVariation(variation.id, productId, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Variation updated");
      router.refresh();
    });
  }

  async function handleDelete() {
    const ok = await confirm({
      title: "Delete this variation?",
      description: `"${variation.name}" (${variation.volume_ml}ml) will be removed from this product.`,
      confirmLabel: "Delete variation",
      variant: "destructive",
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteVariation(variation.id, productId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Variation deleted");
      router.refresh();
    });
  }

  return (
    <li className="rounded-[var(--radius-sm)] border border-[var(--border)] p-3">
      <form onSubmit={handleSave} className="grid gap-3 sm:grid-cols-2">
        <VariationFields
          idPrefix={`edit-${variation.id}`}
          defaults={variation}
          disabled={pending}
          showActive
        />
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" size="sm" disabled={pending}>
            Save
          </Button>
          <Button type="button" size="sm" variant="destructive" disabled={pending} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </form>
    </li>
  );
}
