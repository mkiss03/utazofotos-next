'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { destinations as destSchema } from '@/lib/db/schema';
import { slugify } from '@/lib/slug';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error('Nincs jogosultság.');
}

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createSchema = z.object({
  title: z.string().trim().min(2, 'A cím legalább 2 karakter.').max(200),
  region: z.string().trim().min(2, 'A régió legalább 2 karakter.').max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(slugRegex, 'Csak kisbetű, szám és kötőjel megengedett.'),
});

export type CreateState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof createSchema>, string>>;
};

export async function createDestination(
  _prev: CreateState,
  formData: FormData,
): Promise<CreateState> {
  await requireAdmin();

  const titleRaw = String(formData.get('title') ?? '').trim();
  const regionRaw = String(formData.get('region') ?? '').trim();
  const slugRaw = String(formData.get('slug') ?? '').trim();

  const slug = slugRaw.length > 0 ? slugRaw : slugify(titleRaw);

  const parsed = createSchema.safeParse({
    title: titleRaw,
    region: regionRaw,
    slug,
  });
  if (!parsed.success) {
    const fieldErrors: CreateState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as keyof z.infer<typeof createSchema>;
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { ok: false, error: 'Kérlek javítsd a jelölt mezőket.', fieldErrors };
  }
  const data = parsed.data;

  // Slug ütközés ellenőrzése.
  const [conflict] = await db
    .select({ id: destSchema.id })
    .from(destSchema)
    .where(eq(destSchema.slug, data.slug))
    .limit(1);
  if (conflict) {
    return {
      ok: false,
      error: 'Ez a webcím már foglalt.',
      fieldErrors: { slug: 'Foglalt webcím — válassz másikat.' },
    };
  }

  // A új úticél a végére kerül.
  const maxRow = await db
    .select({ max: destSchema.sortOrder })
    .from(destSchema)
    .orderBy(destSchema.sortOrder);
  const maxSort = maxRow.length
    ? Math.max(...maxRow.map((r) => r.max ?? 0))
    : 0;

  await db.insert(destSchema).values({
    title: data.title,
    slug: data.slug,
    region: data.region,
    sortOrder: maxSort + 10,
    published: false, // alapértelmezésben nem publikus, hogy ki tudd tölteni
    excerpt: '',
    lead: '',
    body: [],
  });

  revalidatePath('/admin/uticelok');
  redirect(`/admin/uticelok/${data.slug}`);
}
