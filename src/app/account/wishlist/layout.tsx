import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Wishlist",
  "Save your favourite Bollybee fragrances to your wishlist."
);

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
