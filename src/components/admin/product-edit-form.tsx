"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  updateProduct,
  addVariation,
  addScentNote,
  uploadProductImage,
  deleteProductImage,
} from "@/actions/admin-products";
import { VariationRow } from "@/components/admin/variation-row";
import { VariationFields } from "@/components/admin/variation-fields";
import { ScentNoteRow } from "@/components/admin/scent-note-row";
import { ImageDropzone } from "@/components/admin/image-dropzone";
import { useConfirm } from "@/components/ui/confirm-provider";
import { FRAGRANCE_FAMILIES } from "@/lib/utils";
import type { Category, Product, ProductVariation, ScentNote, ProductImage } from "@/types";
import Image from "next/image";

interface ProductEditFormProps {
  product: Product & {
    variations?: ProductVariation[];
    scent_notes?: ScentNote[];
    images?: ProductImage[];
  };
  categories: Category[];
}

export function ProductEditForm({ product, categories }: ProductEditFormProps) {
  const confirm = useConfirm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, startUpload] = useTransition();
  const imageAltRef = useRef<HTMLInputElement>(null);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await updateProduct(product.id, new FormData(e.currentTarget));
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Product updated");
    router.refresh();
  }

  async function handleAddVariation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const result = await addVariation(product.id, new FormData(form));
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Variation added");
    form.reset();
    router.refresh();
  }

  async function handleAddNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const result = await addScentNote(
      product.id,
      fd.get("noteType") as string,
      fd.get("name") as string
    );
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Note added");
    form.reset();
    router.refresh();
  }

  function handleImageFile(file: File) {
    const formData = new FormData();
    formData.set("file", file);
    const alt = imageAltRef.current?.value.trim();
    if (alt) formData.set("altText", alt);
    startUpload(async () => {
      const result = await uploadProductImage(product.id, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Image uploaded");
      if (imageAltRef.current) imageAltRef.current.value = "";
      router.refresh();
    });
  }

  const sortedImages = [...(product.images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id)
  );

  return (
    <div className="space-y-12">
      <form onSubmit={handleUpdate} className="max-w-2xl space-y-4">
        <h2 className="font-display text-xl">Product Details</h2>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={product.name} required />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={product.slug} required />
        </div>
        <div>
          <Label htmlFor="categoryId">Category</Label>
          <Select id="categoryId" name="categoryId" defaultValue={product.category_id ?? ""}>
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="fragranceFamily">Family</Label>
          <Select
            id="fragranceFamily"
            name="fragranceFamily"
            defaultValue={product.fragrance_family ?? ""}
          >
            <option value="">None</option>
            {FRAGRANCE_FAMILIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select id="gender" name="gender" defaultValue={product.gender ?? "UNISEX"}>
            <option value="UNISEX">Unisex</option>
            <option value="WOMEN">Women</option>
            <option value="MEN">Men</option>
          </Select>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Audience for this product. Use the Kids category for children’s lines.
          </p>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={product.description ?? ""}
            rows={4}
          />
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="featured" defaultChecked={product.featured} /> Featured
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isBestseller" defaultChecked={product.is_bestseller} />{" "}
            Bestseller
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isNew" defaultChecked={product.is_new} /> New
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="active" defaultChecked={product.active} /> Active
          </label>
        </div>
        <Button type="submit" disabled={loading}>
          Save Changes
        </Button>
      </form>

      <section>
        <h2 className="font-display text-xl">Variations</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Each product can only have one variation per volume (ml). SKUs must be unique across the
          catalogue.
        </p>
        <ul className="mt-4 max-w-lg space-y-3">
          {(product.variations ?? []).map((v) => (
            <VariationRow key={v.id} productId={product.id} variation={v} />
          ))}
        </ul>
        <form onSubmit={handleAddVariation} className="mt-6 grid max-w-lg gap-3 sm:grid-cols-2">
          <p className="text-sm font-medium sm:col-span-2">Add new variation</p>
          <VariationFields idPrefix={`add-${product.id}`} />
          <Button type="submit" className="sm:col-span-2">
            Add Variation
          </Button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl">Scent Notes</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Top, heart, and base notes shown on the product page. Edit or delete existing notes below.
        </p>
        <ul className="mt-4 max-w-lg space-y-3">
          {(product.scent_notes ?? []).map((n) => (
            <ScentNoteRow key={n.id} productId={product.id} note={n} />
          ))}
        </ul>
        <form onSubmit={handleAddNote} className="mt-4 flex flex-wrap items-end gap-2">
          <div>
            <Label htmlFor="noteType">Type</Label>
            <Select id="noteType" name="noteType" defaultValue="TOP">
              <option value="TOP">Top</option>
              <option value="HEART">Heart</option>
              <option value="BASE">Base</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="noteName">Note name</Label>
            <Input id="noteName" name="name" placeholder="e.g. Jasmine" required className="max-w-xs" />
          </div>
          <Button type="submit">Add Note</Button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl">Images</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Upload multiple photos — shoppers can browse all of them on the product page. The first
          image is the main/cover photo.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {sortedImages.map((img, index) => (
            <div
              key={img.id}
              className="relative aspect-square overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)]"
            >
              <Image src={img.image_url} alt={img.alt_text || ""} fill className="object-cover" />
              {index === 0 && (
                <span className="absolute left-1 top-1 rounded-[var(--radius-sm)] bg-white/90 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                  Cover
                </span>
              )}
              <button
                type="button"
                className="absolute right-1 top-1 cursor-pointer rounded-[var(--radius-sm)] bg-white px-2 py-1 text-xs transition-colors hover:bg-[var(--surface)]"
                onClick={async () => {
                  const ok = await confirm({
                    title: "Delete this image?",
                    description: "The image will be permanently removed from this product.",
                    confirmLabel: "Delete image",
                    variant: "destructive",
                  });
                  if (!ok) return;
                  await deleteProductImage(img.id, product.id);
                  toast.success("Image deleted");
                  router.refresh();
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 max-w-md space-y-3">
          <div>
            <Label htmlFor="altText">Alt text (optional, used with next upload)</Label>
            <Input
              ref={imageAltRef}
              id="altText"
              name="altText"
              placeholder="Describe the photo"
              disabled={uploading}
            />
          </div>
          <ImageDropzone
            disabled={uploading}
            label={uploading ? "Uploading…" : "Drop product image here, or click to browse"}
            onFile={handleImageFile}
          />
        </div>
      </section>
    </div>
  );
}
