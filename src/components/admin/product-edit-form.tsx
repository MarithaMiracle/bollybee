"use client";

import { useState } from "react";
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
import { useConfirm } from "@/components/ui/confirm-provider";
import { FRAGRANCE_FAMILIES, formatNaira } from "@/lib/utils";
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

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await updateProduct(product.id, new FormData(e.currentTarget));
    setLoading(false);
    result.error ? toast.error(result.error) : toast.success("Product updated");
  }

  async function handleAddVariation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await addVariation(product.id, new FormData(e.currentTarget));
    result.error ? toast.error(result.error) : toast.success("Variation added");
    if (!result.error) e.currentTarget.reset();
  }

  async function handleAddNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = await addScentNote(
      product.id,
      fd.get("noteType") as string,
      fd.get("name") as string
    );
    result.error ? toast.error(result.error) : toast.success("Note added");
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await uploadProductImage(product.id, new FormData(e.currentTarget));
    result.error ? toast.error(result.error) : toast.success("Image uploaded");
  }

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
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="fragranceFamily">Family</Label>
          <Select id="fragranceFamily" name="fragranceFamily" defaultValue={product.fragrance_family ?? ""}>
            <option value="">None</option>
            {FRAGRANCE_FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={product.description ?? ""} rows={4} />
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={product.featured} /> Featured</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="isBestseller" defaultChecked={product.is_bestseller} /> Bestseller</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="isNew" defaultChecked={product.is_new} /> New</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={product.active} /> Active</label>
        </div>
        <Button type="submit" disabled={loading}>Save Changes</Button>
      </form>

      <section>
        <h2 className="font-display text-xl">Variations</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {(product.variations ?? []).map((v) => (
            <li key={v.id} className="flex flex-col gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] p-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="min-w-0 break-words">{v.name} — {formatNaira(v.price)} — Stock: {v.stock_quantity}</span>
              <span className="shrink-0 text-[var(--muted)]">{v.sku}</span>
            </li>
          ))}
        </ul>
        <form onSubmit={handleAddVariation} className="mt-4 grid max-w-lg gap-3 sm:grid-cols-2">
          <Input name="name" placeholder="50ml" required />
          <Input name="volumeMl" type="number" placeholder="Volume (ml)" required />
          <Input name="price" type="number" placeholder="Price (₦)" required />
          <Input name="compareAtPrice" type="number" placeholder="Compare at (optional)" />
          <Input name="sku" placeholder="SKU" required />
          <Input name="stockQuantity" type="number" placeholder="Stock" required />
          <Button type="submit" className="sm:col-span-2">Add Variation</Button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl">Scent Notes</h2>
        <ul className="mt-4 space-y-1 text-sm">
          {(product.scent_notes ?? []).map((n) => (
            <li key={n.id}>{n.note_type}: {n.name}</li>
          ))}
        </ul>
        <form onSubmit={handleAddNote} className="mt-4 flex flex-wrap gap-2">
          <Select name="noteType" defaultValue="TOP">
            <option value="TOP">Top</option>
            <option value="HEART">Heart</option>
            <option value="BASE">Base</option>
          </Select>
          <Input name="name" placeholder="Note name" required className="max-w-xs" />
          <Button type="submit">Add Note</Button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl">Images</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {(product.images ?? []).map((img) => (
            <div key={img.id} className="relative aspect-square overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)]">
              <Image src={img.image_url} alt={img.alt_text || ""} fill className="object-cover" />
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
        <form onSubmit={handleUpload} className="mt-4 space-y-3 max-w-md">
          <Input name="file" type="file" accept="image/jpeg,image/png,image/webp" required />
          <Input name="altText" placeholder="Alt text" />
          <Button type="submit">Upload Image</Button>
        </form>
      </section>
    </div>
  );
}
