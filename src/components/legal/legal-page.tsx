import Link from "next/link";
import { BackLink } from "@/components/layout/back-link";
import { CONTACT_EMAIL } from "@/lib/contact-info";

export interface LegalSection {
  title: string;
  paragraphs: string[];
  list?: string[];
}

interface LegalPageProps {
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalPage({ title, description, lastUpdated, sections }: LegalPageProps) {
  return (
    <div className="bg-[var(--satin-light)]">
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
      <BackLink href="/" label="Back to home" className="mb-6" />
      <header>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Legal</p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">{description}</p>
        <p className="mt-2 text-xs text-[var(--muted)]">Last updated: {lastUpdated}</p>
      </header>

      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl md:text-2xl">{section.title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-[var(--muted-foreground)] md:text-base">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.list && (
                <ul className="list-disc space-y-2 pl-5">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-12 border-t border-[var(--border)] pt-8 text-sm text-[var(--muted-foreground)]">
        Questions?{" "}
        <Link href="/contact" className="text-[var(--plum)] underline-offset-4 hover:underline">
          Contact us
        </Link>{" "}
        or email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--plum)] underline-offset-4 hover:underline">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
      </div>
    </div>
  );
}
