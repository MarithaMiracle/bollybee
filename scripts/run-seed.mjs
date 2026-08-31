#!/usr/bin/env node
/**
 * Runs seed migration when tables exist but are empty.
 * Requires DATABASE_URL in .env.local (Supabase → Settings → Database → URI).
 *
 * Usage: npm run db:seed
 */
import { readFileSync, existsSync } from "fs";
import pg from "pg";

const { Client } = pg;

function loadEnv() {
  const path = ".env.local";
  if (!existsSync(path)) {
    console.error("❌ .env.local not found.");
    process.exit(1);
  }
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

loadEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL missing in .env.local");
  console.error("   Supabase → Project Settings → Database → Connection string (URI)");
  console.error("   Or paste supabase/migrations/002_seed.sql in the SQL Editor.");
  process.exit(1);
}

const sql = readFileSync("supabase/migrations/002_seed.sql", "utf8");
const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  const { rows } = await client.query("SELECT COUNT(*)::int AS n FROM products");
  if (rows[0].n > 0) {
    console.log("✅ Seed data already present — skipping.");
    process.exit(0);
  }
  console.log("Running seed migration...");
  await client.query(sql);
  const { rows: after } = await client.query("SELECT COUNT(*)::int AS n FROM products");
  console.log(`✅ Seed complete — ${after[0].n} products loaded.`);
} catch (err) {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
