"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  deleteCategory,
  toggleCategory,
  updateCategory,
} from "@/actions/admin-categories";
import { clearCategoryImage, uploadCategoryImage } from "@/actions/admin-site";
import { AdminBadge } from "@/components/admin/admin-badge";
import { ImageDropzone } from "@/components/admin/image-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfirm } from "@/components/ui/confirm-provider";
import type { Category } from "@/types";

interface CategoryRowProps {
  category: Category;
}

export function CategoryRow({ category }: CategoryRowProps) {
  const confirm = useConfirm();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateCategory(category.id, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Category updated");
      router.refresh();
    });
  }

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleCategory(category.id, !category.active);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(category.active ? "Category deactivated" : "Category activated");
      router.refresh();
    });
  }

  async function handleDelete() {
    const ok = await confirm({
      title: "Delete this category?",
      description: `"${category.name}" will be removed. Products using it will keep selling but lose this category label.`,
      confirmLabel: "Delete category",
      variant: "destructive",
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteCategory(category.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Category deleted");
      router.refresh();
    });
  }

  function handleImageFile(file: File) {
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      const result = await uploadCategoryImage(category.id, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Category image updated");
      router.refresh();
    });
  }

  async function handleClearImage() {
    const ok = await confirm({
      title: "Clear category image?",
      description:
        "The homepage will fall back to a product photo from this category (if one exists).",
      confirmLabel: "Clear image",
      variant: "destructive",
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await clearCategoryImage(category.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Category image cleared");
      router.refresh();
    });
  }

  return (
    <li className="border-b border-[var(--border)] px-5 py-5 last:border-b-0">
      <div className="grid gap-6 lg:grid-cols-[7.5rem_1fr]">
        <div className="space-y-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)]">
            {category.image_url ? (
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                className="object-cover"
                sizes="120px"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center p-2 text-center text-[10px] text-[var(--muted)]">
                Uses product photo
              </div>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium">Cover image</p>
            <ImageDropzone
              disabled={pending}
              label={pending ? "Uploading…" : "Drop or click"}
              hint="JPEG/PNG/WebP"
              className="[&_label]:px-2 [&_label]:py-3 [&_label]:text-xs"
              onFile={handleImageFile}
            />
            {category.image_url ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={handleClearImage}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        <form onSubmit={handleSave} className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`name-${category.id}`}>Name</Label>
            <Input
              id={`name-${category.id}`}
              name="name"
              defaultValue={category.name}
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`slug-${category.id}`}>Slug (URL)</Label>
            <Input
              id={`slug-${category.id}`}
              name="slug"
              defaultValue={category.slug}
              required
              disabled={pending}
            />
            <p className="text-xs text-[var(--muted-foreground)]">
              Storefront URL: /shop/{category.slug}
            </p>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={`description-${category.id}`}>Description</Label>
            <Input
              id={`description-${category.id}`}
              name="description"
              defaultValue={category.description ?? ""}
              placeholder="Optional short description"
              disabled={pending}
            />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name="active"
              defaultChecked={category.active}
              disabled={pending}
            />
            Active on storefront
          </label>
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
            <AdminBadge
              label={category.active ? "ACTIVE" : "INACTIVE"}
              variant={category.active ? "success" : "draft"}
            />
            <Button type="submit" size="sm" disabled={pending}>
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={handleToggle}
            >
              {category.active ? "Deactivate" : "Activate"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={pending}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </form>
      </div>
    </li>
  );
}
