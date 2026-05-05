'use server';

import { revalidatePath } from 'next/cache';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { contactMessages } from '@/lib/db/schema';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error('Nincs jogosultság.');
}

export async function listContactMessages() {
  await requireAdmin();
  const rows = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(500);
  return rows;
}

const statusSchema = z.enum(['new', 'replied', 'archived']);

export async function updateContactMessageStatus(
  id: string,
  status: 'new' | 'replied' | 'archived',
) {
  await requireAdmin();
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) throw new Error('Érvénytelen státusz.');

  await db
    .update(contactMessages)
    .set({ status: parsed.data, updatedAt: new Date() })
    .where(eq(contactMessages.id, id));

  revalidatePath('/admin/uzenetek');
}

export async function updateContactMessageNote(id: string, note: string) {
  await requireAdmin();
  const safe = note.trim().slice(0, 5000);
  await db
    .update(contactMessages)
    .set({ adminNote: safe, updatedAt: new Date() })
    .where(eq(contactMessages.id, id));
  revalidatePath('/admin/uzenetek');
}

export async function deleteContactMessage(id: string) {
  await requireAdmin();
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  revalidatePath('/admin/uzenetek');
}
