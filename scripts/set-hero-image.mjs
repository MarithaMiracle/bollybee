#!/usr/bin/env node
/**
 * Uploads the brand hero image to Supabase Storage and sets site_content.hero.
 * Run: npm run db:hero
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error("❌ Missing Supabase env vars");
  process.exit(1);
}

const heroPath = "public/brand/BollyBee_hero_image.png";
if (!existsSync(heroPath)) {
  console.error(`❌ ${heroPath} not found`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);
const storagePath = "site/hero-bottle.png";
const buffer = readFileSync(heroPath);

console.log("Uploading brand hero to Supabase Storage...");

const { error: uploadError } = await supabase.storage
  .from("product-images")
  .upload(storagePath, buffer, {
    contentType: "image/png",
    upsert: true,
  });

if (uploadError) {
  console.error("❌ Upload failed:", uploadError.message);
  console.error("   Ensure supabase/migrations/003_storage.sql has been run.");
  process.exit(1);
}

const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(storagePath);
const imageUrl = urlData.publicUrl;

const { error: dbError } = await supabase.from("site_content").upsert({
  key: "hero",
  image_url: imageUrl,
  alt_text: "Bollybee fragrance bottle on blush silk",
  updated_at: new Date().toISOString(),
});

if (dbError) {
  console.error("❌ site_content update failed:", dbError.message);
  process.exit(1);
}

console.log("✅ Hero image set:", imageUrl);
