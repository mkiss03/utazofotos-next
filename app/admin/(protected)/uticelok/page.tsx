import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { Plus } from 'lucide-react';
import { db } from '@/lib/db';
import { departures } from '@/lib/db/schema';
import { listDestinationsForAdmin } from './actions';
import { DestinationListClient } from './DestinationListClient';

export const dynamic = 'force-dynamic';

export default async function AdminUticelokPage() {
  const list = await listDestinationsForAdmin();

  // Megnézzük úticélonként: hány indulás van összesen / hány jövőbeli.
  const today = new Date().toISOString().slice(0, 10);
  const counts = await db
    .select({
      destinationId: departures.destinationId,
      total: sql<number>`count(*)::int`,
      upcoming: sql<number>`count(*) filter (where ${departures.dateISO} >= ${today})::int`,
    })
    .from(departures)
    .groupBy(departures.destinationId);

  const countMap = new Map(
    counts.map((c) => [c.destinationId, { total: c.total, upcoming: c.upcoming }]),
  );

  const enriched = list.map((d) => ({
    ...d,
    departures: countMap.get(d.id) ?? { total: 0, upcoming: 0 },
  }));

  return (
    <div className="admin-page">
      <header className="admin-page-header admin-page-header-row">
        <div>
          <h1>Úticélok</h1>
          <p className="admin-page-sub">
            A sorrend itt szerkeszthető – ez határozza meg, milyen sorrendben
            jelennek meg a publikus oldalon. A módosítások 1 percen belül
            láthatóak a látogatóknak.
          </p>
        </div>
        <Link href="/admin/uticelok/uj" className="admin-btn admin-btn-primary">
          <Plus size={18} aria-hidden="true" /> Új úticél
        </Link>
      </header>

      <DestinationListClient items={enriched} />
    </div>
  );
}
