import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Order Confirmation",
  "Your Bollybee order was placed successfully."
);

export default function OrderSuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
