import 'server-only';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  destinations as destSchema,
  departures as depSchema,
} from '@/lib/db/schema';
import type {
  Destination,
  Departure,
  DestinationBodyBlock,
  DepartureStatus,
} from '@/lib/destinations';

/**
 * Server-only adatréteg az úticélok lekérdezéséhez.
 * A publikus oldalak ezen keresztül olvasnak a Supabase Postgres-ből.
 *
 * A visszaadott objektumok pontosan a meglévő `Destination` / `Departure`
 * típusoknak felelnek meg, hogy a komponensek (DestinationCard, DepartureList,
 * BookingForm) változtatás nélkül tudjanak velük dolgozni.
 */

interface DbDestRow {
  id: string;
  slug: string;
  title: string;
  region: string;
  excerpt: string;
  lead: string;
  coverImageUrl: string | null;
  body: unknown;
  sortOrder: number;
}

interface DbDepRow {
  id: string;
  destinationId: string;
  dateISO: string;
  dateLabel: string;
  monthShort: string;
  day: string;
  durationDays: number | null;
  priceFrom: string | null;
  status: DepartureStatus;
  note: string | null;
}

function mapDeparture(d: DbDepRow): Departure {
  return {
    id: d.id,
    dateISO: d.dateISO,
    dateLabel: d.dateLabel,
    monthShort: d.monthShort,
    day: d.day,
    durationDays: d.durationDays ?? undefined,
    priceFrom: d.priceFrom ?? undefined,
    status: d.status,
    note: d.note ?? undefined,
  };
}

function mapDestination(d: DbDestRow, deps: DbDepRow[]): Destination {
  return {
    slug: d.slug,
    title: d.title,
    region: d.region,
    excerpt: d.excerpt,
    lead: d.lead,
    coverImage: d.coverImageUrl,
    body: (Array.isArray(d.body) ? d.body : []) as DestinationBodyBlock[],
    departures: deps
      .filter((x) => x.destinationId === d.id)
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
      .map(mapDeparture),
  };
}

/** Az összes publikált úticél, sortOrder szerint. */
export async function getAllDestinations(): Promise<Destination[]> {
  const dests = await db
    .select({
      id: destSchema.id,
      slug: destSchema.slug,
      title: destSchema.title,
      region: destSchema.region,
      excerpt: destSchema.excerpt,
      lead: destSchema.lead,
      coverImageUrl: destSchema.coverImageUrl,
      body: destSchema.body,
      sortOrder: destSchema.sortOrder,
    })
    .from(destSchema)
    .where(eq(destSchema.published, true))
    .orderBy(asc(destSchema.sortOrder));

  if (dests.length === 0) return [];

  const deps = await db
    .select({
      id: depSchema.id,
      destinationId: depSchema.destinationId,
      dateISO: depSchema.dateISO,
      dateLabel: depSchema.dateLabel,
      monthShort: depSchema.monthShort,
      day: depSchema.day,
      durationDays: depSchema.durationDays,
      priceFrom: depSchema.priceFrom,
      status: depSchema.status,
      note: depSchema.note,
    })
    .from(depSchema);

  return dests.map((d) => mapDestination(d, deps));
}

/** Egy úticél slug alapján (publikálttól függetlenül a /admin-on bővíthető lesz). */
export async function getDestinationBySlug(
  slug: string,
): Promise<Destination | null> {
  const [d] = await db
    .select({
      id: destSchema.id,
      slug: destSchema.slug,
      title: destSchema.title,
      region: destSchema.region,
      excerpt: destSchema.excerpt,
      lead: destSchema.lead,
      coverImageUrl: destSchema.coverImageUrl,
      body: destSchema.body,
      sortOrder: destSchema.sortOrder,
    })
    .from(destSchema)
    .where(eq(destSchema.slug, slug))
    .limit(1);

  if (!d) return null;

  const deps = await db
    .select({
      id: depSchema.id,
      destinationId: depSchema.destinationId,
      dateISO: depSchema.dateISO,
      dateLabel: depSchema.dateLabel,
      monthShort: depSchema.monthShort,
      day: depSchema.day,
      durationDays: depSchema.durationDays,
      priceFrom: depSchema.priceFrom,
      status: depSchema.status,
      note: depSchema.note,
    })
    .from(depSchema)
    .where(eq(depSchema.destinationId, d.id));

  return mapDestination(d, deps);
}

/** Csak a publikált úticélok slug-listája (statikus path generáláshoz). */
export async function getAllDestinationSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: destSchema.slug })
    .from(destSchema)
    .where(eq(destSchema.published, true));
  return rows.map((r) => r.slug);
}
