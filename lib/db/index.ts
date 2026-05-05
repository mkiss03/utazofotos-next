import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

/**
 * Egyetlen megosztott Drizzle kliens (Supabase Postgres-szel).
 *
 * Connection pooler URL-t használunk (port 6543), ez a serverless / Vercel
 * környezethez illik. Az ENV neve `DATABASE_URL`, lokálisan `.env.local`-ban,
 * Vercelen a Project Settings → Environment Variables alatt.
 *
 * Csak egy globális kapcsolatot tartunk fent dev újratöltéskor is (HMR safe).
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    '[db] DATABASE_URL nincs beállítva – másold be a .env.local-ba a Supabase connection stringet (Connect → ORMs → Drizzle).',
  );
}

declare global {
  // eslint-disable-next-line no-var
  var __pg__: ReturnType<typeof postgres> | undefined;
}

const sql =
  globalThis.__pg__ ??
  postgres(connectionString ?? 'postgres://invalid', {
    // Pooler-kompatibilis beállítások: prepared statement-ek tiltva
    // (a Supabase transaction-pooler nem támogatja őket).
    prepare: false,
    max: 10,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__pg__ = sql;
}

export const db = drizzle(sql, { schema });

export type DB = typeof db;
export { schema };

