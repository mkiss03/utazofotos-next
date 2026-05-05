'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { bookings, departures, destinations } from '@/lib/db/schema';

/**
 * Foglalási űrlap beküldése — publikus action, nem igényel auth-t.
 * Egyszerű spam-védelem: honeypot mező + min/max hossz validáció.
 */
const bookingSchema = z.object({
  name: z.string().trim().min(2, 'Adj meg egy érvényes nevet.').max(200),
  email: z
    .string()
    .trim()
    .email('Érvénytelen e-mail cím.')
    .max(255),
  phone: z
    .string()
    .trim()
    .min(5, 'Adj meg egy érvényes telefonszámot.')
    .max(60),
  message: z.string().trim().max(2000),
  departureId: z.string().uuid('Kérjük válassz időpontot.'),
  /** Honeypot — embereknél üres, botoknál kitöltve. */
  website: z.string().max(0).optional().nullable(),
});

export type BookingState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof bookingSchema>, string>>;
};

export async function submitBooking(
  _prev: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    message: formData.get('message') ?? '',
    departureId: formData.get('trip'),
    website: formData.get('website') ?? '', // honeypot
  };

  // Honeypot — ha ki van töltve, csendben "elfogadjuk" de nem mentünk.
  if (typeof raw.website === 'string' && raw.website.length > 0) {
    return { ok: true };
  }

  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: BookingState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as keyof z.infer<typeof bookingSchema>;
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return {
      ok: false,
      error: 'Kérlek javítsd a jelölt mezőket.',
      fieldErrors,
    };
  }
  const data = parsed.data;

  // Snapshot az indulásról + úticélról (ha később törölnék).
  const [snapshot] = await db
    .select({
      destinationTitle: destinations.title,
      dateLabel: departures.dateLabel,
      dateISO: departures.dateISO,
    })
    .from(departures)
    .innerJoin(destinations, eq(destinations.id, departures.destinationId))
    .where(eq(departures.id, data.departureId))
    .limit(1);

  if (!snapshot) {
    return { ok: false, error: 'A választott időpont már nem elérhető.' };
  }

  // Lejárt indulásra nem fogadunk el foglalást.
  const todayISO = new Date().toISOString().slice(0, 10);
  if (snapshot.dateISO < todayISO) {
    return {
      ok: false,
      error: 'A választott időpont már lejárt – kérlek válassz egy aktuális indulást.',
    };
  }

  await db.insert(bookings).values({
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    departureId: data.departureId,
    snapshotDestinationTitle: snapshot.destinationTitle,
    snapshotDateLabel: snapshot.dateLabel,
    status: 'new',
  });

  revalidatePath('/admin/foglalasok');

  return { ok: true };
}
