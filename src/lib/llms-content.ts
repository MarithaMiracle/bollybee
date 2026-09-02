import { CONTACT_EMAIL, CONTACT_LOCATION, CONTACT_PHONE, CONTACT_WHATSAPP_HREF, SOCIAL_LINKS } from "@/lib/contact-info";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DEFAULT_OG_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

type CatalogLink = { name: string; url: string; description?: string };

const ABOUT_SUMMARY = [
  "Bollybee Fragrance Lab crafts premium perfumes with imported oils for long-lasting wear.",
  "We serve customers across all 36 Nigerian states and the FCT with secure Paystack checkout.",
  "Volumes include 30ml, 50ml, and 100ml across eau de parfum, body mists, gift sets, and sample packs.",
].join(" ");

const FAQ_ENTRIES = [
  {
    q: "What types of fragrances do you offer?",
    a: "We offer eau de parfum, body mists, gift sets, and sample packs. Each fragrance is available in 30ml, 50ml, and 100ml volumes.",
  },
  {
    q: "How do I place an order?",
    a: "Browse our shop, select your preferred fragrance and volume, add to cart, and proceed to checkout. Pay securely via Paystack.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all payment methods supported by Paystack, including bank transfers, debit cards (Visa, Mastercard, Verve), and USSD.",
  },
  {
    q: "How long does delivery take?",
    a: "Delivery times vary by location. After your order ships, track its status using your order number on our tracking page.",
  },
  {
    q: "Do you deliver nationwide?",
    a: "Yes, we deliver across all 36 Nigerian states and the FCT. Shipping costs are calculated at checkout based on your location.",
  },
  {
    q: "Can I track my order?",
    a: "Yes. Visit our Track Order page and enter your order number and email for real-time status updates.",
  },
  {
    q: "How should I store my fragrance?",
    a: "Store in a cool, dry place away from direct sunlight. Keep the bottle tightly closed to preserve the scent.",
  },
  {
    q: "How do I contact support?",
    a: `Reach us via our Contact page or email ${CONTACT_EMAIL}.`,
  },
] as const;

async function fetchCatalogLinks(): Promise<{
  categories: CatalogLink[];
  products: CatalogLink[];
}> {
  if (!isSupabaseConfigured()) {
    return { categories: [], products: [] };
  }

  try {
    const supabase = createServiceClient();
    const [{ data: categoriesRaw }, { data: productsRaw }] = await Promise.all([
      supabase.from("categories").select("name, slug").eq("active", true).order("name"),
      supabase
        .from("products")
        .select("name, slug, short_description")
        .eq("active", true)
        .order("name"),
    ]);

    const categories = (categoriesRaw ?? [])
      .filter((c) => !["gift-sets", "sample-packs"].includes(c.slug))
      .map((c) => ({
        name: c.name,
        url: `${SITE_URL}/shop/${c.slug}`,
        description: `${c.name} fragrances`,
      }));

    const products = (productsRaw ?? []).map((p) => ({
      name: p.name,
      url: `${SITE_URL}/product/${p.slug}`,
      description: p.short_description || undefined,
    }));

    return { categories, products };
  } catch {
    return { categories: [], products: [] };
  }
}

function formatLinkList(links: CatalogLink[]) {
  return links
    .map((link) => {
      const suffix = link.description ? `: ${link.description}` : "";
      return `- [${link.name}](${link.url})${suffix}`;
    })
    .join("\n");
}

function corePages() {
  return `## Shop

- [Shop all fragrances](${SITE_URL}/shop): Browse the full catalogue with filters by category, notes, and price
- [Gift sets](${SITE_URL}/gift-sets): Curated fragrance gift collections
- [Sample packs](${SITE_URL}/sample-packs): Try scents before committing to full bottles
- [Search](${SITE_URL}/search): Find products by name or note

## Learn

- [About Bollybee](${SITE_URL}/about): Brand story, mission, and why customers choose us
- [FAQ](${SITE_URL}/faq): Orders, payments, delivery, storage, and support

## Customer service

- [Contact](${SITE_URL}/contact): Email form and contact details
- [Track order](${SITE_URL}/track-order): Check order status with order number and email
- [WhatsApp support](${CONTACT_WHATSAPP_HREF}): Chat with the Bollybee team

## Account

- [Sign in or register](${SITE_URL}/account/login): Saved orders, addresses, and wishlist
- [Forgot password](${SITE_URL}/account/forgot-password): Reset account password`;
}

/** Curated index for AI agents — see https://llmstxt.org */
export async function buildLlmsTxt() {
  const { categories, products } = await fetchCatalogLinks();

  const categorySection =
    categories.length > 0
      ? `\n### Categories\n\n${formatLinkList(categories)}`
      : "";

  const featuredProducts = products.slice(0, 12);
  const productSection =
    featuredProducts.length > 0
      ? `\n### Featured products\n\n${formatLinkList(featuredProducts)}`
      : "";

  const optionalProducts =
    products.length > featuredProducts.length
      ? `\n${formatLinkList(products.slice(featuredProducts.length))}`
      : "";

  return `# ${SITE_NAME}

> ${DEFAULT_OG_DESCRIPTION} Based in ${CONTACT_LOCATION}. Nationwide delivery, Paystack payments, and WhatsApp support.

${corePages()}${categorySection}${productSection}

## Optional

- [Privacy policy](${SITE_URL}/privacy)
- [Terms of service](${SITE_URL}/terms)
- [Sitemap](${SITE_URL}/sitemap.xml): Machine-readable list of all public URLs
- [Full site guide for AI](${SITE_URL}/llms-full.txt): Extended brand, FAQ, and catalogue details${optionalProducts ? `\n${optionalProducts}` : ""}
`;
}

/** Extended markdown guide with inline FAQ and catalogue details. */
export async function buildLlmsFullTxt() {
  const { categories, products } = await fetchCatalogLinks();

  const socialLines = SOCIAL_LINKS.map(
    (link) => `- [${link.label}](${link.href}) (${link.handle})`
  ).join("\n");

  const faqSection = FAQ_ENTRIES.map((faq) => `### ${faq.q}\n\n${faq.a}`).join("\n\n");

  return `# ${SITE_NAME} — Full guide

> ${ABOUT_SUMMARY}

## Contact

- Email: [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})
- Phone: ${CONTACT_PHONE}
- Location: ${CONTACT_LOCATION}
- WhatsApp: [Chat on WhatsApp](${CONTACT_WHATSAPP_HREF})

## Social

${socialLines}

## About

Bollybee Fragrance Lab was born from a passion for scent, confidence, and self-expression. Our perfumes use imported premium oils, carefully blended for long-lasting wear and distinctive character — from warm orientals to fresh florals.

**Mission:** Provide world-class fragrances that empower people across Nigeria and beyond to express their unique identity with confidence.

**Why customers choose Bollybee:**
- Imported premium fragrance oils
- Nationwide delivery across all 36 states
- Secure payments via Paystack
- Dedicated customer support
- Easy order tracking

${corePages()}

## Frequently asked questions

${faqSection}

## Catalogue

### Categories

${categories.length > 0 ? formatLinkList(categories) : `- Browse [Shop all fragrances](${SITE_URL}/shop)`}

### Products

${products.length > 0 ? formatLinkList(products) : `- Product listings appear on [Shop all fragrances](${SITE_URL}/shop)`}

## Commerce notes for assistants

- Currency: Nigerian Naira (NGN)
- Checkout: Guest checkout supported; account optional for order history and wishlist
- Payments: Paystack (cards, bank transfer, USSD)
- Shipping: Rates calculated at checkout by Nigerian state and LGA
- Order tracking: Requires order number and email at ${SITE_URL}/track-order
- Admin and API routes are not public and should not be cited to shoppers

## Legal

- [Privacy policy](${SITE_URL}/privacy)
- [Terms of service](${SITE_URL}/terms)
- [Sitemap](${SITE_URL}/sitemap.xml)
- [AI index (short)](${SITE_URL}/llms.txt)
`;
}
