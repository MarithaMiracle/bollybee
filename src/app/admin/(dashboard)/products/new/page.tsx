import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { ProductForm } from "@/components/admin/product-form";
import { BackLink } from "@/components/layout/back-link";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: categories } = await supabase.from("categories").select("*").order("name");

  return (
    <div>
      <BackLink href="/admin/products" label="Back to products" className="mb-6" />
      <h1 className="font-display text-3xl">New Product</h1>
      <div className="mt-8">
        <ProductForm categories={categories ?? []} />
      </div>
    </div>
  );
}
