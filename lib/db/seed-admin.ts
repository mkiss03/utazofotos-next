/**
 * Admin user létrehozása / jelszó frissítése.
 * Futtatás: npm run admin:seed
 *
 * Idempotens: ha a user már létezik, csak a jelszót frissíti.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

const ADMIN_EMAIL = 'utazofotos@admin.com';
const ADMIN_PASSWORD = 'Csibefasirt:2026';
const ADMIN_NAME = 'Zsuzsi';

async function main() {
  const bcrypt = (await import('bcryptjs')).default;
  const { db } = await import('./index');
  const { users } = await import('./schema');
  const { eq } = await import('drizzle-orm');

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ passwordHash, name: ADMIN_NAME, role: 'admin' })
      .where(eq(users.id, existing.id));
    console.log(`✅ Admin frissítve: ${ADMIN_EMAIL}`);
  } else {
    await db.insert(users).values({
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      passwordHash,
      role: 'admin',
    });
    console.log(`✅ Admin létrehozva: ${ADMIN_EMAIL}`);
  }

  console.log('   Jelszó (a forráskódban tárolva — később cseréld /admin felületen).');
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Hiba:', e);
  process.exit(1);
});
