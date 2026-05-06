'use server';

import { revalidatePath } from 'next/cache';
import { eq, asc } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { departures } from '@/lib/db/schema';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error('Nincs jogosultság.');
}

/* ----------------------------------------------------------
   HU dátum formázók
   ---------------------------------------------------------- */
const HU_MONTH_SHORT = [
  'JAN',
  'FEB',
  'MÁR',
  'ÁPR',
  'MÁJ',
  'JÚN',
  'JÚL',
  'AUG',
  'SZEPT',
  'OKT',
  'NOV',
  'DEC',
];
const HU_MONTH_LONG = [
  'január',
  'február',
  'március',
  'április',
  'május',
  'június',
  'július',
  'augusztus',
  'szeptember',
  'október',
  'november',
  'december',
];

function parseISO(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split('-').map((s) => parseInt(s, 10));
  return { y, m, d };
}

function buildDateLabel(dateISO: string, durationDays: number | null): string {
  const a = parseISO(dateISO);
  if (!durationDays || durationDays <= 1) {
    return `${a.y}. ${HU_MONTH_LONG[a.m - 1]} ${a.d}.`;
  }
  // Több napos: "márc. 15. – márc. 22."
  const start = new Date(Date.UTC(a.y, a.m - 1, a.d));
  const end = new Date(start.getTime() + (durationDays - 1) * 86400000);
  const eY = end.getUTCFullYear();
  const eM = end.getUTCMonth();
  const eD = end.getUTCDate();
  const startLabel = `${HU_MONTH_LONG[a.m - 1].slice(0, 4)}. ${a.d}.`;
  const endLabel = `${HU_MONTH_LONG[eM].slice(0, 4)}. ${eD}.`;
  if (eY !== a.y) {
    return `${a.y}. ${startLabel} – ${eY}. ${endLabel}`;
  }
  return `${a.y}. ${startLabel} – ${endLabel}`;
}

const ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const departureSchema = z.object({
  destinationId: z.string().uuid(),
  dateISO: z
    .string()
    .regex(ISO_REGEX, 'A dátum YYYY-MM-DD formátumú legyen.'),
  durationDays: z
    .union([z.coerce.number().int().min(1).max(365), z.literal('')])
    .optional()
    .transform((v) => (v === '' || v === undefined ? null : (v as number))),
  priceFrom: z.string().trim().max(60),
  status: z.enum(['available', 'few', 'full']),
  transportMode: z.enum(['plane', 'bus', 'mixed']),
  maxPeople: z
    .union([z.coerce.number().int().min(1).max(999), z.literal('')])
    .optional()
    .transform((v) => (v === '' || v === undefined ? null : (v as number))),
  note: z.string().trim().max(200),
});

export type DepartureFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function listDeparturesForDestination(destinationId: string) {
  await requireAdmin();
  const rows = await db
    .select()
    .from(departures)
    .where(eq(departures.destinationId, destinationId))
    .orderBy(asc(departures.dateISO));
  return rows;
}

function parseFormData(formData: FormData) {
  return {
    destinationId: String(formData.get('destinationId') ?? ''),
    dateISO: String(formData.get('dateISO') ?? ''),
    durationDays: (formData.get('durationDays') ?? '') as string,
    priceFrom: String(formData.get('priceFrom') ?? ''),
    status: String(formData.get('status') ?? 'available'),
    transportMode: String(formData.get('transportMode') ?? 'plane'),
    maxPeople: (formData.get('maxPeople') ?? '') as string,
    note: String(formData.get('note') ?? ''),
  };
}

export async function createDeparture(
  destinationSlug: string,
  formData: FormData,
): Promise<DepartureFormState> {
  await requireAdmin();
  const raw = parseFormData(formData);
  const parsed = departureSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const k = i.path[0] as string;
      if (!fieldErrors[k]) fieldErrors[k] = i.message;
    }
    return { ok: false, error: 'Kérlek javítsd a jelölt mezőket.', fieldErrors };
  }
  const d = parsed.data;
  const a = parseISO(d.dateISO);

  await db.insert(departures).values({
    destinationId: d.destinationId,
    dateISO: d.dateISO,
    dateLabel: buildDateLabel(d.dateISO, d.durationDays),
    monthShort: HU_MONTH_SHORT[a.m - 1],
    day: String(a.d),
    durationDays: d.durationDays,
    priceFrom: d.priceFrom || null,
    status: d.status,
    transportMode: d.transportMode,
    maxPeople: d.maxPeople,
    note: d.note || null,
  });

  revalidateAll(destinationSlug);
  return { ok: true };
}

export async function updateDeparture(
  id: string,
  destinationSlug: string,
  formData: FormData,
): Promise<DepartureFormState> {
  await requireAdmin();
  const raw = parseFormData(formData);
  const parsed = departureSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const k = i.path[0] as string;
      if (!fieldErrors[k]) fieldErrors[k] = i.message;
    }
    return { ok: false, error: 'Kérlek javítsd a jelölt mezőket.', fieldErrors };
  }
  const d = parsed.data;
  const a = parseISO(d.dateISO);

  await db
    .update(departures)
    .set({
      dateISO: d.dateISO,
      dateLabel: buildDateLabel(d.dateISO, d.durationDays),
      monthShort: HU_MONTH_SHORT[a.m - 1],
      day: String(a.d),
      durationDays: d.durationDays,
      priceFrom: d.priceFrom || null,
      status: d.status,
      transportMode: d.transportMode,
      maxPeople: d.maxPeople,
      note: d.note || null,
      updatedAt: new Date(),
    })
    .where(eq(departures.id, id));

  revalidateAll(destinationSlug);
  return { ok: true };
}

export async function deleteDeparture(id: string, destinationSlug: string) {
  await requireAdmin();
  await db.delete(departures).where(eq(departures.id, id));
  revalidateAll(destinationSlug);
}

function revalidateAll(slug: string) {
  revalidatePath('/admin/uticelok');
  revalidatePath(`/admin/uticelok/${slug}`);
  revalidatePath('/admin/indulasok');
  revalidatePath('/');
  revalidatePath('/uticelok');
  revalidatePath(`/uticelok/${slug}`);
  revalidatePath('/jelentkezes');
}
