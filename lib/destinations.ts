/**
 * ÚTICÉL TÍPUSOK ÉS TISZTA SEGÉDFÜGGVÉNYEK.
 *
 * A tényleges adatok a Supabase Postgres-ből jönnek (lib/data/destinations.ts).
 * Ez a fájl csak típusokat és tiszta (data-mentes) helper függvényeket tartalmaz,
 * amiket szerver és kliens komponensek egyaránt használnak.
 */

export type DepartureStatus = 'available' | 'few' | 'full';
export type TransportMode = 'plane' | 'bus' | 'mixed';

export interface Departure {
  id: string;
  dateLabel: string;
  dateISO: string;
  monthShort: string;
  day: string;
  durationDays?: number;
  priceFrom?: string;
  status: DepartureStatus;
  transportMode: TransportMode;
  maxPeople?: number;
  note?: string;
}

export type DestinationBodyBlock =
  | { type: 'h2'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'image'; src: string; alt: string };

export interface Destination {
  slug: string;
  title: string;
  region: string;
  excerpt: string;
  lead: string;
  coverImage: string | null;
  body: DestinationBodyBlock[];
  departures: Departure[];
}

// --- Tiszta segédfüggvények (csak az átadott adattal dolgoznak) ---

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Egy destináció következő (jövőbeli) szabad/kevés hely indulása. */
export function getNextDeparture(
  d: Destination,
  now: Date = new Date(),
): Departure | undefined {
  return d.departures
    .filter(
      (dep) => dep.status !== 'full' && new Date(dep.dateISO) >= startOfDay(now),
    )
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO))[0];
}

/** Egy destináció *bármelyik* következő indulása (akár betelt is). */
export function getNextAnyDeparture(
  d: Destination,
  now: Date = new Date(),
): Departure | undefined {
  return d.departures
    .filter((dep) => new Date(dep.dateISO) >= startOfDay(now))
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO))[0];
}

/** Egy destináció-tömb rendezése a következő indulás dátuma szerint. */
export function sortByNextDeparture(
  list: Destination[],
  now: Date = new Date(),
): Destination[] {
  return [...list].sort((a, b) => {
    const ad = getNextAnyDeparture(a, now)?.dateISO ?? '9999';
    const bd = getNextAnyDeparture(b, now)?.dateISO ?? '9999';
    return ad.localeCompare(bd);
  });
}

/** Departure keresése egy átadott destináció-listában id alapján. */
export function findDepartureInList(
  list: Destination[],
  id: string,
): { destination: Destination; departure: Departure } | undefined {
  for (const d of list) {
    const dep = d.departures.find((x) => x.id === id);
    if (dep) return { destination: d, departure: dep };
  }
  return undefined;
}

export function statusLabel(s: DepartureStatus): string {
  switch (s) {
    case 'available':
      return 'Szabad helyek';
    case 'few':
      return 'Már csak kevés hely';
    case 'full':
      return 'Betelt';
  }
}
