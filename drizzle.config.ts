import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// .env.local-ot is olvassuk (Next.js konvenció)
config({ path: '.env.local' });

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  verbose: true,
  strict: true,
});
