#!/usr/bin/env node
// One-shot: applies scripts/migrations/001_init.sql to the Neon DB pointed at
// by DATABASE_URL (or DATABASE_URL_UNPOOLED). Idempotent — safe to re-run.

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DATABASE_URL. Run `vercel env pull .env.local` then `node --env-file=.env.local scripts/db-init.mjs`.");
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const sqlText = readFileSync(resolve(here, "migrations/001_init.sql"), "utf8");

const sql = neon(url);
// The HTTP driver executes one statement per call; split on `;` at end-of-line.
const statements = sqlText.split(/;\s*$/m).map(s => s.trim()).filter(Boolean);
for (const stmt of statements) {
  await sql.query(stmt);
  console.log("✓ applied:", stmt.split("\n")[0].slice(0, 80));
}
console.log("Schema applied.");
