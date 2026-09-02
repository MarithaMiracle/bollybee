"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AccountNavState = {
  href: string;
  label: string;
  isLoggedIn: boolean;
};

const DEFAULT_STATE: AccountNavState = {
  href: "/account/login",
  label: "Account",
  isLoggedIn: false,
};

function firstNameFromUser(
  user: SupabaseUser,
  profile: { full_name: string | null } | null
): string {
  const fromProfile = profile?.full_name?.trim().split(/\s+/)[0];
  if (fromProfile) return fromProfile;

  const fromMeta = (user.user_metadata?.full_name as string | undefined)?.trim().split(/\s+/)[0];
  if (fromMeta) return fromMeta;

  const fromEmail = user.email?.split("@")[0];
  if (fromEmail) {
    return fromEmail.charAt(0).toUpperCase() + fromEmail.slice(1);
  }

  return "there";
}

async function loadAccountNavState(supabase: ReturnType<typeof createClient>): Promise<AccountNavState> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return DEFAULT_STATE;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const firstName = firstNameFromUser(user, profile);

  return {
    href: "/account/orders",
    label: `Hello, ${firstName}`,
    isLoggedIn: true,
  };
}

function useAccountNav() {
  const [state, setState] = useState<AccountNavState>(DEFAULT_STATE);

  useEffect(() => {
    const supabase = createClient();

    loadAccountNavState(supabase).then(setState);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadAccountNavState(supabase).then(setState);
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}

export function AccountNavLink({ className }: { className?: string }) {
  const { href, label, isLoggedIn } = useAccountNav();

  return (
    <Link
      href={href}
      className={className}
      aria-label={isLoggedIn ? `${label} — my account` : "Sign in"}
    >
      <User className="h-5 w-5" strokeWidth={1.5} />
    </Link>
  );
}

export function AccountNavTextLink({ className }: { className?: string }) {
  const { href, label, isLoggedIn } = useAccountNav();

  return (
    <Link
      href={href}
      className={
        isLoggedIn
          ? `text-sm normal-case tracking-normal text-[var(--foreground)] hover:text-[var(--plum)] ${className ?? ""}`
          : className
      }
    >
      {label}
    </Link>
  );
}

export function AccountMobileNavLink({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const { href, label, isLoggedIn } = useAccountNav();

  return (
    <Link
      href={href}
      className={isLoggedIn ? `normal-case tracking-normal transition-colors hover:text-[var(--plum)] ${className ?? ""}` : `transition-colors hover:text-[var(--plum)] ${className ?? ""}`}
      onClick={onNavigate}
    >
      {label}
    </Link>
  );
}

export function AccountMobileSignOut({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const { isLoggedIn } = useAccountNav();

  if (!isLoggedIn) return null;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    onNavigate?.();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={`inline-flex min-h-11 w-full cursor-pointer items-center text-left text-sm normal-case tracking-normal text-[var(--muted-foreground)] transition-colors hover:text-[var(--plum)] ${className ?? ""}`}
    >
      Sign out
    </button>
  );
}
