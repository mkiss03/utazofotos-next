'use server';

import { revalidatePath } from 'next/cache';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { bookings, departures, destinations } from '@/lib/db/schema';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error('Nincs jogosultság.');
}

export async function listBookings() {
  await requireAdmin();
  const rows = await db
    .select({
      id: bookings.id,
      name: bookings.name,
      email: bookings.email,
      phone: bookings.phone,
      message: bookings.message,
      adminNote: bookings.adminNote,
      status: bookings.status,
      createdAt: bookings.createdAt,
      snapshotDestinationTitle: bookings.snapshotDestinationTitle,
      snapshotDateLabel: bookings.snapshotDateLabel,
      departureId: bookings.departureId,
      currentDestSlug: destinations.slug,
      currentDestTitle: destinations.title,
      currentDateLabel: departures.dateLabel,
    })
    .from(bookings)
    .leftJoin(departures, eq(departures.id, bookings.departureId))
    .leftJoin(destinations, eq(destinations.id, departures.destinationId))
    .orderBy(desc(bookings.createdAt))
    .limit(500);
  return rows;
}

const statusSchema = z.enum(['new', 'contacted', 'confirmed', 'cancelled']);

export async function updateBookingStatus(
  id: string,
  status: 'new' | 'contacted' | 'confirmed' | 'cancelled',
) {
  await requireAdmin();
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) throw new Error('Érvénytelen státusz.');

  await db
    .update(bookings)
    .set({ status: parsed.data, updatedAt: new Date() })
    .where(eq(bookings.id, id));

  revalidatePath('/admin/foglalasok');
}

export async function updateBookingNote(id: string, note: string) {
  await requireAdmin();
  const safe = note.trim().slice(0, 5000);
  await db
    .update(bookings)
    .set({ adminNote: safe, updatedAt: new Date() })
    .where(eq(bookings.id, id));
  revalidatePath('/admin/foglalasok');
}

export async function deleteBooking(id: string) {
  await requireAdmin();
  await db.delete(bookings).where(eq(bookings.id, id));
  revalidatePath('/admin/foglalasok');
}
