import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { SoftDivider } from "@/components/layout/wave-separator";
import { BackLink } from "@/components/layout/back-link";
import {
  CONTACT_EMAIL,
  CONTACT_LOCATION,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  SOCIAL_LINKS,
} from "@/lib/contact-info";

export const metadata = { title: "Contact" };

const CONTACT_IMAGE = "/brand/bollybee-bottle-water-splash-greyscale.png";

const CONTACT_ROWS = [
  { label: "Email", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { label: "Phone", value: CONTACT_PHONE, href: CONTACT_PHONE_HREF },
  { label: "Location", value: CONTACT_LOCATION },
] as const;

const QUICK_LINKS = [
  { href: "/faq", label: "FAQ" },
  { href: "/track-order", label: "Track your order" },
] as const;

export default function ContactPage() {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src={CONTACT_IMAGE}
          alt=""
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={90}
        />
        <div className="absolute inset-0 bg-black/30" aria-hidden />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-14 md:px-8 md:py-24">
        <BackLink href="/" label="Back to home" className="mb-6 text-white/90 hover:text-white" />
        <article className="brand-panel-xl overflow-hidden bg-[var(--satin-light)] text-[var(--foreground)] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.45)]">
          <header className="px-5 py-8 text-center sm:px-8 sm:py-10 md:px-12 md:py-12">
            <p className="text-[10px] font-medium uppercase tracking-[0.35em]">Get in touch</p>
            <h1 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl">Contact us</h1>
            <p className="mt-3 font-display text-lg italic sm:text-xl md:text-2xl">
              We&apos;d love to hear from you
            </p>
          </header>

          <SoftDivider tone="plum" className="mx-auto max-w-[min(100%,20rem)] opacity-40" />

          <section className="bg-[var(--background)]/90 px-5 py-8 sm:px-8 sm:py-10 md:px-12 md:py-12">
            <div className="mb-8 text-center md:text-left">
              <h2 className="font-display text-2xl md:text-3xl">Write to us</h2>
              <p className="mt-2 text-sm leading-relaxed md:text-base">
                Send a message and we&apos;ll reply by email as soon as we can.
              </p>
            </div>
            <ContactForm />
          </section>

          <section className="px-5 py-8 sm:px-8 sm:py-10 md:px-12">
            <p className="text-center text-[10px] font-medium uppercase tracking-[0.3em]">
              Other ways to reach us
            </p>

            <dl className="mx-auto mt-8 grid max-w-md gap-4">
              {CONTACT_ROWS.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[5.5rem_1fr] items-baseline gap-x-4 gap-y-1 sm:grid-cols-[6rem_1fr]"
                >
                  <dt className="text-[10px] font-medium uppercase tracking-[0.18em]">
                    {row.label}
                  </dt>
                  <dd className="break-words font-display text-lg leading-snug">
                    {"href" in row && row.href ? (
                      <a href={row.href} className="break-all underline-offset-4 hover:underline">
                        {row.value}
                      </a>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <dl className="mx-auto mt-6 grid max-w-md gap-4">
              {SOCIAL_LINKS.map((social) => (
                <div
                  key={social.label}
                  className="grid grid-cols-[5.5rem_1fr] items-baseline gap-x-4 gap-y-1 sm:grid-cols-[6rem_1fr]"
                >
                  <dt className="text-[10px] font-medium uppercase tracking-[0.18em]">
                    {social.label}
                  </dt>
                  <dd className="break-words font-display text-lg leading-snug">
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-4 hover:underline"
                    >
                      {social.handle}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>

            <SoftDivider tone="border" className="mx-auto mt-8 max-w-md opacity-60" />
            <div className="mx-auto mt-6 flex max-w-md flex-wrap gap-4 text-sm font-medium">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group inline-flex items-center gap-1 underline-offset-4 hover:underline"
                >
                  {link.label}
                  <ArrowUpRight
                    className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={1.5}
                  />
                </Link>
              ))}
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
