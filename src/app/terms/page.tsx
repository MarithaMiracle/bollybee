import { LegalPage } from "@/components/legal/legal-page";

export const metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using Bollybee and purchasing our fragrances.",
};

const LAST_UPDATED = "August 31, 2026";

const SECTIONS = [
  {
    title: "Agreement to Terms",
    paragraphs: [
      "These Terms of Service (\"Terms\") govern your access to and use of the Bollybee website and services operated by Bollybee Fragrance Lab (\"Bollybee\", \"we\", \"us\", or \"our\").",
      "By accessing our website or placing an order, you agree to be bound by these Terms. If you do not agree, you may not use our services.",
    ],
  },
  {
    title: "Products and Pricing",
    paragraphs: [
      "We sell fragrances, gift sets, sample packs, and related products as described on our website. Product images are for illustration; packaging may vary slightly.",
      "All prices are listed in Nigerian Naira (₦) unless otherwise stated. We reserve the right to change prices at any time. The price charged will be the price displayed at checkout when you complete your order.",
      "We strive to maintain accurate product descriptions and availability. If an item is unavailable after you order, we will contact you and offer a refund or alternative.",
    ],
  },
  {
    title: "Orders and Payment",
    paragraphs: [
      "Placing an order constitutes an offer to purchase. We reserve the right to accept or decline any order, for example due to stock limitations, pricing errors, or suspected fraud.",
      "Payment must be completed at checkout via Paystack. Your order is confirmed once payment is successfully processed. You will receive an order confirmation by email.",
      "You are responsible for providing accurate delivery and contact information. We are not liable for delays or failed delivery caused by incorrect details you provide.",
    ],
  },
  {
    title: "Shipping and Delivery",
    paragraphs: [
      "We deliver nationwide across Nigeria. Shipping fees are calculated at checkout based on your delivery location.",
      "Estimated delivery times vary by state and logistics partner. Tracking information will be provided when your order ships. Delivery times are estimates and not guaranteed.",
      "Risk of loss passes to you upon delivery to the address you provide.",
    ],
  },
  {
    title: "Returns and Refunds",
    paragraphs: [
      "Due to the nature of fragrance products, we accept returns only for items that are damaged, defective, or incorrectly fulfilled. Items must be reported within 48 hours of delivery with photographic evidence.",
      "Opened or used fragrance products cannot be returned for hygiene and safety reasons, except where they are faulty.",
      "Approved refunds will be processed to the original payment method within 7–14 business days. Shipping fees are non-refundable unless the return is due to our error.",
      "To request a return or report an issue, contact us at hello@bollybee.com with your order number.",
    ],
  },
  {
    title: "Accounts",
    paragraphs: [
      "You may create an account to view order history and track purchases. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.",
      "We may suspend or terminate accounts that violate these Terms or engage in fraudulent activity.",
    ],
  },
  {
    title: "Intellectual Property",
    paragraphs: [
      "All content on this website — including text, images, logos, product names, and design — is owned by Bollybee or its licensors and protected by copyright and trademark laws.",
      "You may not reproduce, distribute, or use our content without prior written permission.",
    ],
  },
  {
    title: "Prohibited Use",
    paragraphs: ["You agree not to:"],
    list: [
      "Use our website for any unlawful purpose.",
      "Attempt to gain unauthorised access to our systems or other users' accounts.",
      "Submit false or misleading order or contact information.",
      "Resell products purchased from us in violation of applicable law or our policies.",
    ],
  },
  {
    title: "Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by law, Bollybee shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services or products.",
      "Our total liability for any claim related to an order shall not exceed the amount you paid for that order.",
      "Nothing in these Terms excludes liability that cannot be excluded under Nigerian law.",
    ],
  },
  {
    title: "Governing Law",
    paragraphs: [
      "These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be subject to the exclusive jurisdiction of the courts of Lagos State, Nigeria.",
    ],
  },
  {
    title: "Changes to These Terms",
    paragraphs: [
      "We may update these Terms from time to time. Changes will be posted on this page with an updated date. Continued use of our services after changes constitutes acceptance of the revised Terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="Please read these terms carefully before using Bollybee or placing an order."
      lastUpdated={LAST_UPDATED}
      sections={SECTIONS}
    />
  );
}
