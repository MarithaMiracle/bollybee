import type { Product } from "@/types";

export function ProductJsonLd({ product, minPrice }: { product: Product; minPrice: number }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description || product.description,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "NGN",
      lowPrice: minPrice,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
