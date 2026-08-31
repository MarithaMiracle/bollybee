#!/usr/bin/env node
/**
 * Runs a SQL migration file against Supabase Postgres.
 * Requires DATABASE_URL in .env.local (Supabase → Settings → Database → URI).
 *
 * Usage: node scripts/run-migration.mjs supabase/migrations/004_stock_images.sql
 */
import { readFileSync, existsSync } from "fs";
import pg from "pg";

const { Client } = pg;

function loadEnv() {
  if (!existsSync(".env.local")) {
    console.error("❌ .env.local not found.");
    process.exit(1);
  }
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

loadEnv();

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/run-migration.mjs <path-to.sql>");
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL missing in .env.local");
  console.error("   Supabase → Project Settings → Database → Connection string (URI)");
  console.error(`   Or paste ${file} in the Supabase SQL Editor.`);
  process.exit(1);
}

const sql = readFileSync(file, "utf8");
const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log(`Running ${file}...`);
  await client.query(sql);
  console.log("✅ Migration complete.");
} catch (err) {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
