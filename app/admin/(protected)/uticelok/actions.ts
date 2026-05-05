'use server';

import { revalidatePath } from 'next/cache';
import { eq, asc, and, gt, lt, desc } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { destinations as destSchema } from '@/lib/db/schema';

/**
 * Admin műveletek az úticélok listájához.
 * Minden műveletnél ellenőrizzük a session-t (defense in depth a middleware mellett).
 */

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error('Nincs jogosultság.');
  return session;
}

/** Egy úticél felfelé mozgatása (kisebb sortOrder). */
export async function moveDestinationUp(id: string) {
  await requireAdmin();

  const [current] = await db
    .select({ id: destSchema.id, sortOrder: destSchema.sortOrder })
    .from(destSchema)
    .where(eq(destSchema.id, id))
    .limit(1);
  if (!current) return;

  // Megkeressük az előtte lévőt (közvetlenül kisebb sortOrder).
  const [prev] = await db
    .select({ id: destSchema.id, sortOrder: destSchema.sortOrder })
    .from(destSchema)
    .where(lt(destSchema.sortOrder, current.sortOrder))
    .orderBy(desc(destSchema.sortOrder))
    .limit(1);
  if (!prev) return; // már a tetején

  // Cseréljük a sortOrder értékeket.
  await db
    .update(destSchema)
    .set({ sortOrder: prev.sortOrder, updatedAt: new Date() })
    .where(eq(destSchema.id, current.id));
  await db
    .update(destSchema)
    .set({ sortOrder: current.sortOrder, updatedAt: new Date() })
    .where(eq(destSchema.id, prev.id));

  revalidatePath('/admin/uticelok');
  revalidatePath('/uticelok');
  revalidatePath('/');
}

/** Egy úticél lefelé mozgatása (nagyobb sortOrder). */
export async function moveDestinationDown(id: string) {
  await requireAdmin();

  const [current] = await db
    .select({ id: destSchema.id, sortOrder: destSchema.sortOrder })
    .from(destSchema)
    .where(eq(destSchema.id, id))
    .limit(1);
  if (!current) return;

  const [next] = await db
    .select({ id: destSchema.id, sortOrder: destSchema.sortOrder })
    .from(destSchema)
    .where(gt(destSchema.sortOrder, current.sortOrder))
    .orderBy(asc(destSchema.sortOrder))
    .limit(1);
  if (!next) return;

  await db
    .update(destSchema)
    .set({ sortOrder: next.sortOrder, updatedAt: new Date() })
    .where(eq(destSchema.id, current.id));
  await db
    .update(destSchema)
    .set({ sortOrder: current.sortOrder, updatedAt: new Date() })
    .where(eq(destSchema.id, next.id));

  revalidatePath('/admin/uticelok');
  revalidatePath('/uticelok');
  revalidatePath('/');
}

/** Publikálás be/ki kapcsolása. */
export async function toggleDestinationPublished(id: string, published: boolean) {
  await requireAdmin();

  await db
    .update(destSchema)
    .set({ published, updatedAt: new Date() })
    .where(eq(destSchema.id, id));

  revalidatePath('/admin/uticelok');
  revalidatePath('/uticelok');
  revalidatePath('/');
}

/**
 * Sortorder normalizálása: 10, 20, 30, … hézagokkal.
 * Akkor hasznos, ha az ismételt up/down műveletek után összezsugorodtak az értékek.
 */
export async function normalizeSortOrder() {
  await requireAdmin();

  const all = await db
    .select({ id: destSchema.id })
    .from(destSchema)
    .orderBy(asc(destSchema.sortOrder));

  for (let i = 0; i < all.length; i++) {
    await db
      .update(destSchema)
      .set({ sortOrder: (i + 1) * 10 })
      .where(eq(destSchema.id, all[i].id));
  }

  revalidatePath('/admin/uticelok');
}

/** Az admin lista lekérdezése (publikálási státusszal együtt). */
export async function listDestinationsForAdmin() {
  await requireAdmin();

  const rows = await db
    .select({
      id: destSchema.id,
      slug: destSchema.slug,
      title: destSchema.title,
      region: destSchema.region,
      coverImageUrl: destSchema.coverImageUrl,
      sortOrder: destSchema.sortOrder,
      published: destSchema.published,
      updatedAt: destSchema.updatedAt,
    })
    .from(destSchema)
    .orderBy(asc(destSchema.sortOrder));

  return rows;
}
