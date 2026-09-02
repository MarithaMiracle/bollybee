import { LegalPage } from "@/components/legal/legal-page";

export const metadata = {
  title: "Privacy Policy",
  description: "How Bollybee collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "August 31, 2026";

const SECTIONS = [
  {
    title: "Introduction",
    paragraphs: [
      "Bollybee Fragrance Lab (\"Bollybee\", \"we\", \"us\", or \"our\") operates bollybeefragrancelab.com and related services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, create an account, or place an order.",
      "By using our services, you agree to the collection and use of information in accordance with this policy. If you do not agree, please do not use our website.",
    ],
  },
  {
    title: "Information We Collect",
    paragraphs: ["We may collect the following types of information:"],
    list: [
      "Identity and contact details: name, email address, phone number, and delivery address.",
      "Order information: products purchased, order history, and transaction references.",
      "Account credentials: email and password when you register for an account.",
      "Communications: messages you send via our contact form or customer support channels.",
      "Newsletter subscriptions: email address when you opt in to marketing communications.",
      "Technical data: IP address, browser type, device information, and pages visited (via cookies and similar technologies).",
    ],
  },
  {
    title: "How We Use Your Information",
    paragraphs: ["We use the information we collect to:"],
    list: [
      "Process and fulfil your orders, including payment and delivery.",
      "Provide order tracking and customer support.",
      "Manage your account and order history.",
      "Send transactional emails such as order confirmations and shipping updates.",
      "Send marketing communications where you have opted in (you may unsubscribe at any time).",
      "Improve our website, products, and services.",
      "Detect and prevent fraud or abuse.",
      "Comply with legal obligations.",
    ],
  },
  {
    title: "Payment Processing",
    paragraphs: [
      "Payments are processed securely through Paystack. We do not store your full card details on our servers. Paystack collects and processes payment information according to its own privacy policy and PCI-DSS standards.",
      "We receive limited payment data from Paystack, such as transaction reference, amount, and payment status, to confirm and fulfil your order.",
    ],
  },
  {
    title: "Sharing Your Information",
    paragraphs: [
      "We do not sell your personal information. We may share your data with trusted third parties only where necessary to operate our business:",
    ],
    list: [
      "Payment processors (Paystack) to complete transactions.",
      "Delivery and logistics partners to ship your orders.",
      "Email and hosting providers that help us run our website and communications.",
      "Law enforcement or regulators when required by applicable law.",
    ],
  },
  {
    title: "Data Retention",
    paragraphs: [
      "We retain your personal information for as long as necessary to fulfil the purposes described in this policy, including to satisfy legal, accounting, or reporting requirements. Order records are typically retained for a minimum period required by applicable commercial and tax laws.",
    ],
  },
  {
    title: "Cookies",
    paragraphs: [
      "We use cookies and similar technologies to keep you signed in, remember cart contents, and understand how visitors use our site. You can control cookies through your browser settings, though disabling certain cookies may affect site functionality.",
    ],
  },
  {
    title: "Your Rights",
    paragraphs: [
      "Under the Nigeria Data Protection Act (NDPA) and applicable regulations, you may have the right to access, correct, delete, or restrict processing of your personal data, and to withdraw consent where processing is based on consent.",
      "To exercise these rights, contact us at hello@bollybeefragrancelab.com. We will respond within a reasonable timeframe.",
    ],
  },
  {
    title: "Security",
    paragraphs: [
      "We implement appropriate technical and organisational measures to protect your personal information. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    title: "Children",
    paragraphs: [
      "Our services are not directed to individuals under 18. We do not knowingly collect personal information from children. If you believe we have collected information from a minor, please contact us so we can delete it.",
    ],
  },
  {
    title: "Changes to This Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated \"Last updated\" date. Continued use of our services after changes constitutes acceptance of the revised policy.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="Your privacy matters to us. This policy describes how Bollybee handles your personal data when you shop with us."
      lastUpdated={LAST_UPDATED}
      sections={SECTIONS}
    />
  );
}
