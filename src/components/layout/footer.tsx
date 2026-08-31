"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";

const FOOTER_LINKS = {
  Shop: [
    { href: "/shop", label: "All Fragrances" },
    { href: "/gift-sets", label: "Gift Sets" },
    { href: "/sample-packs", label: "Sample Packs" },
  ],
  Info: [
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
    { href: "/track-order", label: "Track Order" },
  ],
};

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <BrandLogo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--muted-foreground)]">
              Premium fragrances crafted for the modern Nigerian. Soft luxury, bottled.
            </p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--muted-foreground)] hover:text-[var(--plum)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="mb-4 text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
              Contact
            </h4>
            <p className="text-sm text-[var(--muted-foreground)]">
              hello@bollybee.com
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Lagos, Nigeria
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 md:flex-row">
          <p className="text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} Bollybee Fragrance Lab. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-[var(--muted)]">
            <Link href="/privacy" className="hover:text-[var(--plum)]">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--plum)]">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
