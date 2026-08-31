"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateProduct,
  addVariation,
  addScentNote,
  uploadProductImage,
  deleteProductImage,
} from "@/actions/admin-products";
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
          <select id="categoryId" name="categoryId" defaultValue={product.category_id ?? ""} className="flex h-11 w-full border px-3 text-sm">
            <option value="">None</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="fragranceFamily">Family</Label>
          <select id="fragranceFamily" name="fragranceFamily" defaultValue={product.fragrance_family ?? ""} className="flex h-11 w-full border px-3 text-sm">
            <option value="">None</option>
            {FRAGRANCE_FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <textarea id="description" name="description" defaultValue={product.description ?? ""} rows={4} className="w-full border p-3 text-sm" />
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
            <li key={v.id} className="flex justify-between border p-3">
              <span>{v.name} — {formatNaira(v.price)} — Stock: {v.stock_quantity}</span>
              <span className="text-[var(--muted)]">{v.sku}</span>
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
          <select name="noteType" className="border px-3 py-2 text-sm">
            <option value="TOP">Top</option>
            <option value="HEART">Heart</option>
            <option value="BASE">Base</option>
          </select>
          <Input name="name" placeholder="Note name" required className="max-w-xs" />
          <Button type="submit">Add Note</Button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl">Images</h2>
        <div className="mt-4 grid grid-cols-3 gap-4">
          {(product.images ?? []).map((img) => (
            <div key={img.id} className="relative aspect-square border">
              <Image src={img.image_url} alt={img.alt_text || ""} fill className="object-cover" />
              <button
                type="button"
                className="absolute right-1 top-1 bg-white px-2 py-1 text-xs"
                onClick={() => deleteProductImage(img.id, product.id).then(() => toast.success("Deleted"))}
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
