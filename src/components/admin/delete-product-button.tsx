"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProduct } from "@/actions/admin-products";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-provider";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const confirm = useConfirm();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleDelete() {
    const ok = await confirm({
      title: "Delete this product?",
      description: `"${productName}" and all its variations, images, and scent notes will be permanently removed. This cannot be undone.`,
      confirmLabel: "Delete product",
      variant: "destructive",
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Product deleted");
      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={pending}
      className="mt-6"
    >
      {pending ? "Deleting…" : "Delete product"}
    </Button>
  );
}
