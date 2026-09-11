import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCard, AdminEmpty } from "@/components/admin/admin-card";
import { CategoryCreateForm } from "@/components/admin/category-create-form";
import { CategoryRow } from "@/components/admin/category-row";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  const total = categories?.length ?? 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Categories"
        description={`${total} categor${total === 1 ? "y" : "ies"} · create and manage shop sections`}
      />

      <AdminCard>
        <CategoryCreateForm />
      </AdminCard>

      <AdminCard>
        {!categories?.length ? (
          <AdminEmpty message="No categories yet. Add your first category above." />
        ) : (
          <ul>
            {categories.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
