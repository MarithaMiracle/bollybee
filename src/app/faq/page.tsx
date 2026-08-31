const FAQS = [
  { q: "What types of fragrances do you offer?", a: "We offer eau de parfum, body mists, gift sets, and sample packs. Each fragrance is available in 30ml, 50ml, and 100ml volumes." },
  { q: "How do I place an order?", a: "Browse our shop, select your preferred fragrance and volume, add to cart, and proceed to checkout. Pay securely via Paystack." },
  { q: "What payment methods do you accept?", a: "We accept all payment methods supported by Paystack, including bank transfers, debit cards (Visa, Mastercard, Verve), and USSD." },
  { q: "How long does delivery take?", a: "Delivery times vary by location. After your order ships, track its status using your order number on our tracking page." },
  { q: "Do you deliver nationwide?", a: "Yes, we deliver across all 36 Nigerian states and the FCT. Shipping costs are calculated at checkout based on your location." },
  { q: "Can I track my order?", a: "Yes. Visit our Track Order page and enter your order number and email for real-time status updates." },
  { q: "How should I store my fragrance?", a: "Store in a cool, dry place away from direct sunlight. Keep the bottle tightly closed to preserve the scent." },
  { q: "How do I contact support?", a: "Reach us via our Contact page or email hello@bollybee.com." },
];

export const metadata = { title: "FAQ" };

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
      <h1 className="font-display text-4xl">Frequently Asked Questions</h1>
      <dl className="mt-10 divide-y divide-[var(--border)]">
        {FAQS.map((faq) => (
          <div key={faq.q} className="py-6">
            <dt className="font-display text-lg">{faq.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{faq.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
