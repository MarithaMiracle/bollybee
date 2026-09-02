import type { Metadata } from "next";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/cart/cart-provider";
import { ConfirmProvider } from "@/components/ui/confirm-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DEFAULT_OG_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Bollybee — Premium Fragrances",
    template: "%s | Bollybee",
  },
  description: DEFAULT_OG_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: SITE_NAME,
    title: "Bollybee — Premium Fragrances",
    description: DEFAULT_OG_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Bollybee — Premium Fragrances",
    description: DEFAULT_OG_DESCRIPTION,
  },
  icons: {
    icon: [{ url: "/brand/bollybee-mark.png", type: "image/png" }],
    apple: [{ url: "/brand/bollybee-mark.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <CartProvider>
          <ConfirmProvider>
            <Navbar />
            <main className="flex min-w-0 flex-1 flex-col">{children}</main>
            <Footer />
            <Toaster position="bottom-center" richColors />
          </ConfirmProvider>
        </CartProvider>
      </body>
    </html>
  );
}
