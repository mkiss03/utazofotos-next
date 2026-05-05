'use server';

import { revalidatePath } from 'next/cache';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { media } from '@/lib/db/schema';
import {
  buildMediaPathname,
  deleteFromStorage,
  getPublicUrl,
  uploadToStorage,
} from '@/lib/storage';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error('Nincs jogosultság.');
  return session;
}

/** Listázás (legújabb előbb) az admin médiatárban. */
export async function listMedia() {
  await requireAdmin();
  const rows = await db
    .select()
    .from(media)
    .orderBy(desc(media.createdAt))
    .limit(500);
  return rows;
}

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export type UploadState = {
  ok: boolean;
  error?: string;
  uploaded?: number;
};

/**
 * Egy vagy több kép feltöltése (FormData "files" mezővel).
 */
export async function uploadMedia(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const session = await requireAdmin();

  const files = formData.getAll('files').filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return { ok: false, error: 'Nincs kiválasztott fájl.' };
  }

  let uploadedCount = 0;
  for (const file of files) {
    if (!ALLOWED_MIME.has(file.type)) {
      return {
        ok: false,
        error: `Nem támogatott típus: ${file.name} (${file.type}). JPG, PNG, WEBP, GIF vagy AVIF szükséges.`,
        uploaded: uploadedCount,
      };
    }
    if (file.size > MAX_BYTES) {
      return {
        ok: false,
        error: `Túl nagy fájl: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.`,
        uploaded: uploadedCount,
      };
    }

    const pathname = buildMediaPathname(file.name);
    const buf = Buffer.from(await file.arrayBuffer());
    await uploadToStorage(pathname, buf, file.type);
    const url = getPublicUrl(pathname);

    // Méretek beolvasása: jelenleg nem futtatunk image-detect-et a szerveren —
    // a width/height majd később, ha kell. (Senior fókusz: bonyolult deps nélkül.)
    await db.insert(media).values({
      url,
      pathname,
      filename: file.name.slice(0, 255),
      mimeType: file.type,
      sizeBytes: file.size,
      alt: '',
      uploadedById: (session.user as { id?: string }).id ?? null,
    });
    uploadedCount++;
  }

  revalidatePath('/admin/media');
  return { ok: true, uploaded: uploadedCount };
}

const altSchema = z.object({
  id: z.string().uuid(),
  alt: z.string().trim().max(200),
});

export async function updateMediaAlt(id: string, alt: string) {
  await requireAdmin();
  const parsed = altSchema.safeParse({ id, alt });
  if (!parsed.success) throw new Error('Érvénytelen adat.');

  await db
    .update(media)
    .set({ alt: parsed.data.alt })
    .where(eq(media.id, parsed.data.id));
  revalidatePath('/admin/media');
}

export async function deleteMedia(id: string) {
  await requireAdmin();

  const [row] = await db.select().from(media).where(eq(media.id, id)).limit(1);
  if (!row) return;

  // Először a Storage-ból (ha az adatbázisból törölnénk először és a Storage hívás
  // megbukik, árva fájl marad — fordítva legalább a DB-ben látjuk az árva sort).
  try {
    await deleteFromStorage(row.pathname);
  } catch (e) {
    // Ha a Storage-ból eltűnt valamiért, akkor is töröljük a DB sort.
    console.warn('Storage törlés sikertelen, folytatjuk a DB törléssel:', e);
  }
  await db.delete(media).where(eq(media.id, id));

  revalidatePath('/admin/media');
}
