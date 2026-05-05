'use server';

import { desc } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { media } from '@/lib/db/schema';

/**
 * A médiatár képeinek lekérdezése — több helyről is használjuk
 * (médiatár oldal, kép-választó modális).
 */
export async function listMediaForPicker() {
  const session = await auth();
  if (!session?.user) throw new Error('Nincs jogosultság.');

  const rows = await db
    .select({
      id: media.id,
      url: media.url,
      filename: media.filename,
      alt: media.alt,
      sizeBytes: media.sizeBytes,
    })
    .from(media)
    .orderBy(desc(media.createdAt))
    .limit(500);
  return rows;
}
