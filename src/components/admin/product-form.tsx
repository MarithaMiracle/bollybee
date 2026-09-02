"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createProduct } from "@/actions/admin-products";
import { FRAGRANCE_FAMILIES } from "@/lib/utils";
import type { Category } from "@/types";

export function ProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createProduct(formData);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Product created");
    router.push(`/admin/products/${result.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" placeholder="auto-generated if empty" />
        </div>
        <div>
          <Label htmlFor="categoryId">Category</Label>
          <Select id="categoryId" name="categoryId">
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="fragranceFamily">Fragrance Family</Label>
          <Select id="fragranceFamily" name="fragranceFamily">
            <option value="">None</option>
            {FRAGRANCE_FAMILIES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select id="gender" name="gender" defaultValue="UNISEX">
            <option value="UNISEX">Unisex</option>
            <option value="WOMEN">Women</option>
            <option value="MEN">Men</option>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="shortDescription">Short Description</Label>
        <Input id="shortDescription" name="shortDescription" />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={4} />
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="featured" /> Featured</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="isBestseller" /> Bestseller</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="isNew" defaultChecked /> New</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked /> Active</label>
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create Product"}</Button>
    </form>
  );
}
