'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/auth';
import { setSiteContent } from '@/lib/site-content';

async function requireAdmin(): Promise<string | null> {
  const session = await auth();
  if (!session?.user) throw new Error('Nincs jogosultság.');
  return (session.user as { id?: string }).id ?? null;
}

export type SaveState = {
  ok: boolean;
  error?: string;
};

const urlOrPath = z
  .string()
  .trim()
  .min(1, 'Adj meg egy kép URL-t vagy útvonalat.')
  .max(500)
  .refine(
    (v) => v.startsWith('/') || /^https?:\/\//.test(v),
    'Érvénytelen URL — vagy http(s) link, vagy / kezdetű útvonal.',
  );

const heroSchema = z.object({
  title: z.string().trim().min(1, 'A főcím nem lehet üres.').max(200),
  imageUrl: urlOrPath,
  imageAlt: z.string().trim().max(200),
});

export async function saveHero(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const userId = await requireAdmin();
  const parsed = heroSchema.safeParse({
    title: formData.get('title'),
    imageUrl: formData.get('imageUrl'),
    imageAlt: formData.get('imageAlt'),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Hibás adatok.' };
  }
  await setSiteContent('hero', parsed.data, userId);
  revalidatePath('/');
  return { ok: true };
}

const aboutSchema = z.object({
  introLine: z.string().trim().max(200),
  title: z.string().trim().min(1, 'A cím nem lehet üres.').max(120),
  paragraphs: z
    .array(z.string().trim().min(1, 'A bekezdés nem lehet üres.').max(2000))
    .min(1, 'Legalább egy bekezdés kell.')
    .max(20),
  closing: z.string().trim().max(300),
  portraitUrl: urlOrPath,
  portraitAlt: z.string().trim().max(200),
});

export async function saveAbout(prev: SaveState, formData: FormData): Promise<SaveState> {
  const userId = await requireAdmin();
  // bekezdéseket JSON-ben kapjuk a kliensből
  const parasJson = formData.get('paragraphs');
  let paragraphs: unknown = [];
  try {
    paragraphs = JSON.parse(typeof parasJson === 'string' ? parasJson : '[]');
  } catch {
    return { ok: false, error: 'A bekezdések formátuma hibás.' };
  }
  const parsed = aboutSchema.safeParse({
    introLine: formData.get('introLine'),
    title: formData.get('title'),
    paragraphs,
    closing: formData.get('closing'),
    portraitUrl: formData.get('portraitUrl'),
    portraitAlt: formData.get('portraitAlt'),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Hibás adatok.' };
  }
  await setSiteContent('about', parsed.data, userId);
  revalidatePath('/rolam');
  return { ok: true };
}

const scheduleSchema = z.object({
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().max(200),
});

export async function saveSchedule(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const userId = await requireAdmin();
  const parsed = scheduleSchema.safeParse({
    title: formData.get('title'),
    subtitle: formData.get('subtitle'),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Hibás adatok.' };
  }
  await setSiteContent('schedule', parsed.data, userId);
  revalidatePath('/menetrend');
  return { ok: true };
}

const contactSchema = z.object({
  phone: z.string().trim().min(3, 'Telefonszám szükséges.').max(60),
  email: z.string().trim().email('Érvénytelen e-mail.').max(255),
  facebookUrl: z.string().trim().url('Érvénytelen URL.').max(500),
  facebookLabel: z.string().trim().max(120),
});

export async function saveContact(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const userId = await requireAdmin();
  const parsed = contactSchema.safeParse({
    phone: formData.get('phone'),
    email: formData.get('email'),
    facebookUrl: formData.get('facebookUrl'),
    facebookLabel: formData.get('facebookLabel'),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Hibás adatok.' };
  }
  await setSiteContent('contact', parsed.data, userId);
  // Kapcsolati infó több helyen is megjelenik (pl. footer).
  revalidatePath('/');
  revalidatePath('/kapcsolat');
  revalidatePath('/menetrend');
  revalidatePath('/rolam');
  return { ok: true };
}
