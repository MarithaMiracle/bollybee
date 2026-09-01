#!/usr/bin/env node
/**
 * Verifies Supabase connection and checks if core tables exist.
 * Run: node scripts/verify-setup.mjs
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */
import { readFileSync, existsSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const path = ".env.local";
  if (!existsSync(path)) {
    console.error("❌ .env.local not found. Copy .env.example and add your keys.");
    process.exit(1);
  }
  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

const tables = [
  "products",
  "categories",
  "orders",
  "states",
  "shipping_rates",
  "wishlist_items",
  "saved_addresses",
  "product_reviews",
  "promo_codes",
  "abandoned_carts",
];

console.log("Checking Supabase connection...\n");

let ok = true;
for (const table of tables) {
  const { error } = await supabase.from(table).select("id").limit(1);
  if (error) {
    console.log(`❌ ${table}: ${error.message}`);
    ok = false;
  } else {
    const { count } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    console.log(`✅ ${table}: ${count ?? 0} rows`);
  }
}

if (!ok) {
  console.log("\n⚠️  Run migrations in Supabase SQL Editor:");
  console.log("   1. supabase/migrations/001_schema.sql");
  console.log("   2. supabase/migrations/002_seed.sql");
  console.log("   3. supabase/migrations/003_storage.sql");
  console.log("   4. supabase/migrations/006_features.sql  ← wishlist, reviews, promos, addresses");
  console.log("\n   Dashboard: https://supabase.com/dashboard/project/_/sql/new");
  process.exit(1);
}

const { count: productCount } = await supabase
  .from("products")
  .select("*", { count: "exact", head: true });

if ((productCount ?? 0) === 0) {
  console.log("\n⚠️  Schema exists but no products found.");
  console.log("   Run supabase/migrations/002_seed.sql in the SQL Editor, or:");
  console.log("   Add DATABASE_URL to .env.local and run: npm run db:seed");
  process.exit(1);
}

console.log("\n✅ Supabase is configured and migrations appear applied.");
console.log("\nNext steps:");
console.log("  npm run dev");
console.log("  Promote admin: UPDATE profiles SET role = 'ADMIN' WHERE id = 'your-user-uuid';");
