import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { ProductEditForm } from "@/components/admin/product-edit-form";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const supabase = createServiceClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, variations:product_variations(*), scent_notes(*), images:product_images(*)")
      .eq("id", id)
      .single(),
    supabase.from("categories").select("*").order("name"),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl">Edit: {product.name}</h1>
      <div className="mt-8">
        <ProductEditForm product={product} categories={categories ?? []} />
      </div>
    </div>
  );
}
