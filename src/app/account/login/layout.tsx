import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Sign In",
  "Sign in to your Bollybee account to track orders and manage your wishlist."
);

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
