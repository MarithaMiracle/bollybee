import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Track Order",
  "Track your Bollybee fragrance order with your order number."
);

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
