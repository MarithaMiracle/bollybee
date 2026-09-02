import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Addresses",
  "Manage saved delivery addresses for your Bollybee orders."
);

export default function AddressesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
