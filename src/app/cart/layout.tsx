import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Shopping Cart",
  "Review fragrances in your Bollybee cart before checkout."
);

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
