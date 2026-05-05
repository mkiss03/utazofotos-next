'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { contactMessages } from '@/lib/db/schema';

export type ContactState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Partial<Record<'name' | 'email' | 'message', string>>;
};

const schema = z.object({
  name: z.string().trim().min(2, 'Add meg a neved.').max(200),
  email: z.string().trim().email('Érvénytelen e-mail cím.').max(255),
  message: z.string().trim().min(5, 'Írj rövid üzenetet.').max(5000),
  // honeypot
  website: z.string().max(0).optional(),
});

export async function submitContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const raw = {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    message: String(formData.get('message') ?? ''),
    website: String(formData.get('website') ?? ''),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: ContactState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as 'name' | 'email' | 'message' | undefined;
      if (k && !fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { ok: false, error: 'Kérlek javítsd a jelölt mezőket.', fieldErrors };
  }

  // honeypot ellenőrzés (bot szűrő)
  if (parsed.data.website && parsed.data.website.length > 0) {
    return { ok: true };
  }

  await db.insert(contactMessages).values({
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
    status: 'new',
  });

  revalidatePath('/admin/uzenetek');
  return { ok: true };
}
