import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: subs } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="font-display text-3xl">Newsletter Subscribers</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">{(subs ?? []).length} subscribers</p>
      <ul className="mt-6 divide-y divide-[var(--border)] border border-[var(--border)] bg-white">
        {(subs ?? []).map((s) => (
          <li key={s.id} className="flex justify-between p-4 text-sm">
            <span>{s.email}</span>
            <span className="text-[var(--muted)]">{s.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
