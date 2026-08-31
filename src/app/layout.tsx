import type { Metadata } from "next";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/cart/cart-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Bollybee — Premium Fragrances",
    template: "%s | Bollybee",
  },
  description:
    "Premium perfume and fragrance e-commerce. Discover signature scents crafted for Nigeria.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "Bollybee Fragrance Lab",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <Toaster position="bottom-center" richColors />
        </CartProvider>
      </body>
    </html>
  );
}
