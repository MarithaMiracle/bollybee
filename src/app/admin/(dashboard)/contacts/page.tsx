import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminContactsPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: contacts } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="font-display text-3xl">Contact Messages</h1>
      <ul className="mt-8 divide-y divide-[var(--border)] border border-[var(--border)] bg-white">
        {(contacts ?? []).map((c) => (
          <li key={c.id} className="p-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{c.name}</span>
              <span className="text-[var(--muted)]">{c.status}</span>
            </div>
            <p className="text-xs text-[var(--muted)]">{c.email} · {c.subject}</p>
            <p className="mt-2 text-sm">{c.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
