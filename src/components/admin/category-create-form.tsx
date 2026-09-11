"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCategory } from "@/actions/admin-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CategoryCreateForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await createCategory(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Category added");
      form.reset();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5">
      <h2 className="font-display text-lg">Add category</h2>
      <p className="text-sm text-[var(--muted-foreground)]">
        New categories appear in shop filters and product category dropdowns once active.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="e.g. Body Spray" required disabled={pending} />
        </div>
        <div>
          <Label htmlFor="slug">Slug (optional)</Label>
          <Input
            id="slug"
            name="slug"
            placeholder="auto from name if empty"
            disabled={pending}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Input
            id="description"
            name="description"
            placeholder="Short description for this category"
            disabled={pending}
          />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add category"}
      </Button>
    </form>
  );
}
