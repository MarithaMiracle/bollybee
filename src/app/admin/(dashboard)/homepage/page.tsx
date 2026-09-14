import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { HomepageHeroEditor } from "@/components/admin/homepage-hero-editor";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: hero } = await supabase
    .from("site_content")
    .select("image_url, alt_text")
    .eq("key", "hero")
    .maybeSingle();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Homepage"
        description="Edit landing page visuals. Category tile images are managed under Categories."
      />

      <AdminCard>
        <HomepageHeroEditor
          imageUrl={hero?.image_url ?? null}
          altText={hero?.alt_text ?? null}
        />
      </AdminCard>

      <AdminCard>
        <div className="space-y-3 p-5">
          <h2 className="font-display text-lg">Shop by Category images</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Upload a cover image on each category. If none is set, the homepage falls back to a
            product photo from that category.
          </p>
          <Link
            href="/admin/categories"
            className="inline-flex text-sm text-[var(--plum)] underline-offset-4 hover:underline"
          >
            Open Categories →
          </Link>
        </div>
      </AdminCard>
    </div>
  );
}
