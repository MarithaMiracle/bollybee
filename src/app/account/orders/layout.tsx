import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "My Orders",
  "View your Bollybee order history and track deliveries."
);

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
