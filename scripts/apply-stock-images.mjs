#!/usr/bin/env node
/**
 * Applies stock image URLs via Supabase REST (no DATABASE_URL needed).
 * Run: npm run db:stock-images
 * Replaces existing Unsplash demo URLs automatically.
 */
import { readFileSync, existsSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  if (!existsSync(".env.local")) {
    console.error("❌ .env.local not found");
    process.exit(1);
  }
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("❌ Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(url, key);
const force = process.argv.includes("--force");
const isDemoUrl = (value) =>
  !value || value.includes("images.unsplash.com");

/** Unsplash URL — products use 2000px for retina-sharp cards and detail pages */
const u = (id, w = 2000, q = 90) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=${q}&auto=format&fit=crop`;

const STOCK = {
  products: {
    "velvet-amber": u("1592945403244-b3fbafd7f539"),
    "golden-oud": u("1772191399367-91ed8d95664b"),
    "midnight-bloom": u("1587017539504-67cfbddac569"),
    "vanilla-noir": u("1611146264101-358a3b387eee"),
    "citrus-muse": u("1585218334450-afcf929da36e"),
    "royal-musk": u("1541643600914-78b084683601"),
    "sandalwood-reserve": u("1725138804277-3216924a8f5c"),
    "rose-elan": u("1595425959632-34f2822322ce"),
  },
  giftSets: {
    "signature-trio": u("1605463967516-b73a52062ab0", 1200),
    "discovery-collection": u("1718466044521-d38654f3ba0a", 1200),
    "floral-discovery-pack": u("1588514912908-8f5891714f8d", 1200),
    "oriental-discovery-pack": u("1615634260167-c8cdede054de", 1200),
  },
  categories: {
    perfumes: u("1541643600914-78b084683601", 800),
    "eau-de-parfum": u("1615160460366-2c9a41771b51", 800),
    "body-mists": u("1622618991746-fe6004db3a47", 800),
    "gift-sets": u("1605463967516-b73a52062ab0", 800),
    "sample-packs": u("1718466044521-d38654f3ba0a", 800),
    unisex: u("1523293182086-7651a899d37f", 800),
    "mens-fragrance": u("1617839400561-d55457a29da2", 800),
    "womens-fragrance": u("1595456578656-5b0378a9a954", 800),
  },
};

console.log("Applying stock images to Supabase...\n");
console.log("Note: hero → npm run db:hero | about → npm run db:about\n");

const { data: products } = await supabase.from("products").select("id, slug, name");
for (const p of products ?? []) {
  const imageUrl = STOCK.products[p.slug];
  if (!imageUrl) continue;

  const { data: existing } = await supabase
    .from("product_images")
    .select("id, image_url")
    .eq("product_id", p.id)
    .order("sort_order")
    .limit(1);

  const row = existing?.[0];
  if (row && !force && !isDemoUrl(row.image_url)) {
    console.log(`⏭️  ${p.slug}: custom image kept`);
    continue;
  }

  if (row) {
    const { error } = await supabase
      .from("product_images")
      .update({ image_url: imageUrl, alt_text: `${p.name} perfume` })
      .eq("id", row.id);
    console.log(error ? `❌ ${p.slug}: ${error.message}` : `✅ product: ${p.slug} (updated)`);
  } else {
    const { error } = await supabase.from("product_images").insert({
      product_id: p.id,
      image_url: imageUrl,
      alt_text: `${p.name} perfume`,
      sort_order: 0,
    });
    console.log(error ? `❌ ${p.slug}: ${error.message}` : `✅ product: ${p.slug}`);
  }
}

for (const [slug, imageUrl] of Object.entries(STOCK.giftSets)) {
  const { data: existing } = await supabase
    .from("gift_sets")
    .select("image_url")
    .eq("slug", slug)
    .maybeSingle();

  if (existing?.image_url && !force && !isDemoUrl(existing.image_url)) {
    console.log(`⏭️  gift_set ${slug}: custom image kept`);
    continue;
  }

  const { error } = await supabase
    .from("gift_sets")
    .update({ image_url: imageUrl })
    .eq("slug", slug);
  console.log(error ? `❌ gift_set ${slug}: ${error.message}` : `✅ gift_set: ${slug}`);
}

for (const [slug, imageUrl] of Object.entries(STOCK.categories)) {
  const { data: existing } = await supabase
    .from("categories")
    .select("image_url")
    .eq("slug", slug)
    .maybeSingle();

  if (existing?.image_url && !force && !isDemoUrl(existing.image_url)) {
    console.log(`⏭️  category ${slug}: custom image kept`);
    continue;
  }

  const { error } = await supabase
    .from("categories")
    .update({ image_url: imageUrl })
    .eq("slug", slug);
  console.log(error ? `❌ category ${slug}: ${error.message}` : `✅ category: ${slug}`);
}

console.log("\nDone. Refresh the storefront to see stock images.");
