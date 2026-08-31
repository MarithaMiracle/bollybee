"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
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

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-8">
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
          <Link
            href="/account/login"
            className="hidden p-2 text-[var(--foreground)] hover:text-[var(--plum)] md:block"
            aria-label="Account"
          >
            <User className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <Link
            href="/account/login"
            className="hidden text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)] hover:text-[var(--plum)] lg:block"
          >
            Account
          </Link>
          <Link
            href="/search"
            className="p-2 text-[var(--foreground)] hover:text-[var(--plum)]"
            aria-label="Search"
          >
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <Link
            href="/cart"
            className="relative p-2 text-[var(--foreground)] hover:text-[var(--plum)]"
            aria-label={`Cart, ${count} items`}
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center bg-[var(--plum)] text-[9px] text-white">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="p-2 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-[var(--border)] bg-white px-4 py-6 md:hidden" aria-label="Mobile">
          <ul className="space-y-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block text-sm uppercase tracking-[0.18em]"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/account/login"
                className="block text-sm uppercase tracking-[0.18em]"
                onClick={() => setMobileOpen(false)}
              >
                Account
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
