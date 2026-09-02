"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { FooterEdge } from "@/components/layout/filigree-divider";
import { FOOTER_SOCIAL_ICONS } from "@/components/layout/social-icons";
import {
  CONTACT_EMAIL,
  CONTACT_LOCATION,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  SOCIAL_LINKS,
} from "@/lib/contact-info";

const socialLinkClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--plum)]/35 bg-[var(--blush)]/40 text-[var(--plum)] shadow-md transition-all hover:border-[var(--border)] hover:bg-white/70 hover:text-[var(--muted-foreground)] hover:shadow-sm";

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
    <>
      <FooterEdge />
      <footer className="relative z-0 bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            <div className="md:col-span-1">
              <BrandLogo />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Premium fragrances crafted for the modern Nigerian. Soft luxury, bottled.
              </p>
            </div>
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h4 className="mb-4 text-[10px] uppercase tracking-[0.24em] text-muted">
                  {title}
                </h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-[var(--plum)]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h4 className="mb-4 text-[10px] uppercase tracking-[0.24em] text-muted">
                Contact
              </h4>
              <p className="text-sm text-muted-foreground">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="transition-colors hover:text-[var(--plum)]"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                <a
                  href={CONTACT_PHONE_HREF}
                  className="transition-colors hover:text-[var(--plum)]"
                >
                  {CONTACT_PHONE}
                </a>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{CONTACT_LOCATION}</p>
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {SOCIAL_LINKS.map((social, index) => {
                  const Icon = FOOTER_SOCIAL_ICONS[social.label as keyof typeof FOOTER_SOCIAL_ICONS];
                  const rollDelayClass =
                    index === 1
                      ? "footer-social-roll-delay-1"
                      : index === 2
                        ? "footer-social-roll-delay-2"
                        : "";
                  return (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Follow Bollybee on ${social.label}`}
                        className={socialLinkClass}
                      >
                        <span className={`footer-social-roll ${rollDelayClass}`.trim()}>
                          <Icon className="h-4 w-4" />
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-muted">
              © {new Date().getFullYear()} Bollybee Fragrance Lab. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-muted">
              <Link href="/privacy" className="hover:text-[var(--plum)]">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-[var(--plum)]">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
