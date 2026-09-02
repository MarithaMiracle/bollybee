import { SiteContainer } from "@/components/layout/site-container";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <SiteContainer className="py-10 md:py-16">{children}</SiteContainer>;
}
