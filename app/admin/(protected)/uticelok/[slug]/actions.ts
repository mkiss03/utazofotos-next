'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq, and, ne } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { destinations as destSchema } from '@/lib/db/schema';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error('Nincs jogosultság.');
  return session;
}

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const updateBasicSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(2, 'A cím legalább 2 karakter.').max(200),
  slug: z
    .string()
    .trim()
    .min(2, 'A webcím legalább 2 karakter.')
    .max(120)
    .regex(slugRegex, 'Csak kisbetű, szám és kötőjel megengedett.'),
  region: z.string().trim().min(2, 'A régió legalább 2 karakter.').max(80),
  excerpt: z.string().trim().max(500, 'A rövid leírás maximum 500 karakter.'),
  lead: z.string().trim().max(2000, 'A bevezető maximum 2000 karakter.'),
  coverImageUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  coverImageAlt: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  sortOrder: z.coerce.number().int().min(0).max(100000),
  published: z.boolean(),
});

export type UpdateBasicState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof updateBasicSchema>, string>>;
  /** Ha megváltozott a slug, az új slug, hogy a kliens átirányítson rá. */
  newSlug?: string;
};

/**
 * Alapadatok mentése. Server action form-mal hívva (FormData).
 */
export async function updateDestinationBasic(
  _prev: UpdateBasicState,
  formData: FormData,
): Promise<UpdateBasicState> {
  await requireAdmin();

  const raw = {
    id: formData.get('id'),
    title: formData.get('title'),
    slug: formData.get('slug'),
    region: formData.get('region'),
    excerpt: formData.get('excerpt') ?? '',
    lead: formData.get('lead') ?? '',
    coverImageUrl: formData.get('coverImageUrl') ?? '',
    coverImageAlt: formData.get('coverImageAlt') ?? '',
    sortOrder: formData.get('sortOrder'),
    published: formData.get('published') === 'on' || formData.get('published') === 'true',
  };

  const parsed = updateBasicSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: UpdateBasicState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as keyof z.infer<typeof updateBasicSchema>;
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { ok: false, error: 'Kérlek javítsd a jelölt mezőket.', fieldErrors };
  }
  const data = parsed.data;

  // Slug egyediség ellenőrzése (ne ütközzön másik úticéllal).
  const [conflict] = await db
    .select({ id: destSchema.id })
    .from(destSchema)
    .where(and(eq(destSchema.slug, data.slug), ne(destSchema.id, data.id)))
    .limit(1);
  if (conflict) {
    return {
      ok: false,
      error: 'Ez a webcím már foglalt egy másik úticélnál.',
      fieldErrors: { slug: 'Foglalt webcím — válassz másikat.' },
    };
  }

  await db
    .update(destSchema)
    .set({
      title: data.title,
      slug: data.slug,
      region: data.region,
      excerpt: data.excerpt,
      lead: data.lead,
      coverImageUrl: data.coverImageUrl,
      coverImageAlt: data.coverImageAlt,
      sortOrder: data.sortOrder,
      published: data.published,
      updatedAt: new Date(),
    })
    .where(eq(destSchema.id, data.id));

  revalidatePath('/admin/uticelok');
  revalidatePath(`/admin/uticelok/${data.slug}`);
  revalidatePath('/uticelok');
  revalidatePath(`/uticelok/${data.slug}`);
  revalidatePath('/');

  return { ok: true, newSlug: data.slug };
}

/** Egyetlen úticél lekérdezése slug alapján (admin nézet — publikálatlant is). */
export async function getDestinationBySlugForAdmin(slug: string) {
  await requireAdmin();
  const [row] = await db
    .select()
    .from(destSchema)
    .where(eq(destSchema.slug, slug))
    .limit(1);
  return row ?? null;
}

/**
 * Úticél törlése. A `departures` táblában a destinationId FK ON DELETE CASCADE,
 * tehát az indulások is törlődnek. Bookings.departureId SET NULL — a foglalások
 * megmaradnak, csak az indulási hivatkozás lesz null.
 */
export async function deleteDestination(id: string) {
  await requireAdmin();

  await db.delete(destSchema).where(eq(destSchema.id, id));

  revalidatePath('/admin/uticelok');
  revalidatePath('/uticelok');
  revalidatePath('/');
  redirect('/admin/uticelok');
}
