import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Checkout",
  "Complete your Bollybee fragrance order with secure Paystack payment."
);

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
