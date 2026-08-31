import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/wishlist", label: "Wishlist" },
];

export async function AccountNav({ active }: { active: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const firstName =
    profile?.full_name?.trim().split(/\s+/)[0] ||
    (user.user_metadata?.full_name as string | undefined)?.split(/\s+/)[0] ||
    user.email?.split("@")[0] ||
    "there";

  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-6">
      <div>
        <p className="text-sm text-[var(--muted-foreground)]">Hello, {firstName}</p>
        <nav className="mt-3 flex flex-wrap gap-4">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm ${active === l.href ? "font-medium text-[var(--plum)] underline" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <form
        action={async () => {
          "use server";
          await signOut();
          redirect("/");
        }}
      >
        <Button type="submit" variant="outline" size="sm">
          Sign Out
        </Button>
      </form>
    </div>
  );
}
