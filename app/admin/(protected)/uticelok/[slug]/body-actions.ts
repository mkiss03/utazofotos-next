'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { destinations as destSchema } from '@/lib/db/schema';
import type { DestinationBodyBlock } from '@/lib/db/schema';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error('Nincs jogosultság.');
}

const blockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('h2'), text: z.string().max(300) }),
  z.object({ type: z.literal('p'), text: z.string().max(5000) }),
  z.object({
    type: z.literal('ul'),
    items: z.array(z.string().max(500)).max(50),
  }),
  z.object({
    type: z.literal('image'),
    src: z.string().max(500),
    alt: z.string().max(200),
  }),
]);
const bodySchema = z.array(blockSchema).max(60);

export type UpdateBodyState = {
  ok: boolean;
  error?: string;
};

export async function updateDestinationBody(
  id: string,
  slug: string,
  body: DestinationBodyBlock[],
): Promise<UpdateBodyState> {
  await requireAdmin();

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: 'Érvénytelen blokk-szerkezet.' };
  }

  await db
    .update(destSchema)
    .set({ body: parsed.data, updatedAt: new Date() })
    .where(eq(destSchema.id, id));

  revalidatePath('/admin/uticelok');
  revalidatePath(`/admin/uticelok/${slug}`);
  revalidatePath('/uticelok');
  revalidatePath(`/uticelok/${slug}`);

  return { ok: true };
}
