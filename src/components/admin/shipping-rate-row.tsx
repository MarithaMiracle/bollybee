"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  deleteShippingRate,
  toggleShippingRate,
  updateShippingRatePrice,
} from "@/actions/admin-shipping";
import { AdminBadge } from "@/components/admin/admin-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/ui/confirm-provider";
import { formatNaira } from "@/lib/utils";

interface ShippingRateRowProps {
  id: string;
  stateName: string;
  lgaName: string | null;
  price: number;
  active: boolean;
}

export function ShippingRateRow({
  id,
  stateName,
  lgaName,
  price,
  active,
}: ShippingRateRowProps) {
  const confirm = useConfirm();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function runAction(action: () => Promise<{ error?: string }>, successMessage: string) {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(successMessage);
      router.refresh();
    });
  }

  function handleSave(formData: FormData) {
    const nextPrice = Number(formData.get("price"));
    runAction(() => updateShippingRatePrice(id, nextPrice), "Shipping rate updated");
  }

  async function handleToggle() {
    runAction(
      () => toggleShippingRate(id, !active),
      active ? "Rate deactivated" : "Rate activated"
    );
  }

  async function handleDelete() {
    const ok = await confirm({
      title: "Delete shipping rate?",
      description: `Remove the ${lgaName ?? "state-wide"} rate for ${stateName}?`,
      confirmLabel: "Delete rate",
      variant: "destructive",
    });
    if (!ok) return;
    runAction(() => deleteShippingRate(id), "Shipping rate deleted");
  }

  return (
    <tr className={`transition-colors hover:bg-[var(--surface)]/50 ${!active ? "opacity-60" : ""}`}>
      <td data-label="State" className="px-5 py-4 font-medium">
        {stateName}
      </td>
      <td data-label="LGA" className="px-5 py-4 text-[var(--muted-foreground)]">
        {lgaName ?? "State-wide"}
      </td>
      <td data-label="Price" className="px-5 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(new FormData(e.currentTarget));
          }}
          className="flex flex-wrap items-center gap-2"
        >
          <Input
            name="price"
            type="number"
            min={0}
            step={100}
            defaultValue={price}
            className="w-28"
            disabled={pending}
          />
          <Button type="submit" size="sm" variant="outline" disabled={pending}>
            Save
          </Button>
        </form>
        <p className="mt-1 text-xs text-[var(--muted)] md:hidden">{formatNaira(price)}</p>
      </td>
      <td data-label="Status" className="px-5 py-4">
        <AdminBadge label={active ? "Active" : "Inactive"} variant={active ? "success" : "draft"} />
      </td>
      <td data-label="Actions" className="px-5 py-4">
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={handleToggle}>
            {active ? "Deactivate" : "Activate"}
          </Button>
          <Button type="button" size="sm" variant="destructive" disabled={pending} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}
