"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, MapPin, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
] as const;

export function AccountHeader() {
  const router = useRouter();
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      const name =
        profile?.full_name?.trim().split(/\s+/)[0] ||
        (user.user_metadata?.full_name as string | undefined)?.trim().split(/\s+/)[0] ||
        user.email?.split("@")[0] ||
        "there";

      setFirstName(name.charAt(0).toUpperCase() + name.slice(1));
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
          My account
        </p>
        <h1 className="mt-2 font-display text-2xl text-[var(--foreground)] sm:text-3xl md:text-4xl">
          {firstName ? `Hello, ${firstName}` : "Welcome back"}
        </h1>
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        className="cursor-pointer text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)] transition-colors hover:text-[var(--plum)]"
      >
        Sign out
      </button>
    </div>
  );
}

export function AccountTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="scroll-touch mt-8 flex gap-1 overflow-x-auto border-b border-[var(--border)] pb-px"
      aria-label="Account sections"
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm transition-colors -mb-px",
              active
                ? "border-[var(--plum)] font-medium text-[var(--plum)]"
                : "border-transparent text-[var(--muted-foreground)] hover:border-[var(--border)] hover:text-[var(--foreground)]"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
