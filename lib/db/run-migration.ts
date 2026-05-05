import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';
import fs from 'node:fs';
import path from 'node:path';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL hiányzik a .env.local-ból.');

const file = process.argv[2];
if (!file) throw new Error('Használat: tsx lib/db/run-migration.ts <sql-file>');

const fullPath = path.resolve(file);
const sqlText = fs.readFileSync(fullPath, 'utf8');
const stmts = sqlText.split('--> statement-breakpoint').map((s) => s.trim()).filter(Boolean);

const sql = postgres(url, { max: 1 });

async function main() {
  for (const s of stmts) {
    console.log('->', s.split('\n')[0].slice(0, 90));
    await sql.unsafe(s);
  }
  await sql.end();
  console.log('✅ Migráció lefutott.');
}

main().catch(async (e) => {
  console.error('❌ Hiba:', e);
  await sql.end();
  process.exit(1);
});
