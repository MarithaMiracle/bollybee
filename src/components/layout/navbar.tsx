"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { siteContainerClassName } from "@/components/layout/site-container";
import { SwirlDivider } from "@/components/layout/filigree-divider";
import {
  AccountMobileNavLink,
  AccountNavLink,
  AccountNavTextLink,
} from "@/components/layout/account-nav-link";
import { useCart } from "@/components/cart/cart-provider";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/gift-sets", label: "Gift Sets" },
  { href: "/sample-packs", label: "Sample Packs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50">
      <div className="relative z-0 bg-background">
        <div
          className={cn(
            siteContainerClassName,
            "flex h-16 items-center justify-between md:h-20"
          )}
        >
          <BrandLogo />

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-xs uppercase tracking-[0.18em] transition-colors hover:text-[var(--plum)]",
                  pathname === link.href && "text-[var(--plum)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">
            <AccountNavLink className="hidden p-2 text-[var(--foreground)] hover:text-[var(--plum)] md:block" />
            <AccountNavTextLink className="hidden lg:block text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)] hover:text-[var(--plum)]" />
            <Link
              href="/search"
              className="cursor-pointer p-2 text-[var(--foreground)] transition-colors hover:text-[var(--plum)]"
              aria-label="Search"
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/cart"
              className="relative cursor-pointer p-2 text-[var(--foreground)] transition-colors hover:text-[var(--plum)]"
              aria-label={`Cart, ${count} items`}
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--plum)] px-1 text-[9px] font-medium leading-none text-white">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
            <button
              type="button"
              className="cursor-pointer p-2 transition-colors hover:text-[var(--plum)] md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border px-4 py-6 md:hidden" aria-label="Mobile">
            <ul className="space-y-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block text-sm uppercase tracking-[0.18em] transition-colors hover:text-[var(--plum)]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <AccountMobileNavLink
                  className="block text-sm uppercase tracking-[0.18em]"
                  onNavigate={() => setMobileOpen(false)}
                />
              </li>
            </ul>
          </nav>
        )}
      </div>

      <SwirlDivider />
    </header>
  );
}
