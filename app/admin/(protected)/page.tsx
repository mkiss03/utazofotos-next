import Link from 'next/link';
import { sql, gte } from 'drizzle-orm';
import { ExternalLink, Mailbox, MapPinned, CalendarDays } from 'lucide-react';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { destinations, departures, bookings } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await auth();

  const today = new Date().toISOString().slice(0, 10);

  const [destStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      published: sql<number>`count(*) FILTER (WHERE ${destinations.published} = true)::int`,
    })
    .from(destinations);

  const [depStats] = await db
    .select({
      upcoming: sql<number>`count(*)::int`,
    })
    .from(departures)
    .where(gte(departures.dateISO, today));

  const [bookStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      newOnes: sql<number>`count(*) FILTER (WHERE ${bookings.status} = 'new')::int`,
    })
    .from(bookings);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Üdv, {session?.user?.name ?? 'Admin'}!</h1>
        <p className="admin-page-sub">
          Itt szerkesztheted a weboldalad tartalmát. Bal oldalt kiválaszthatod,
          mit szeretnél módosítani.
        </p>
      </header>

      {bookStats.newOnes > 0 && (
        <div className="admin-alert">
          <Mailbox size={20} aria-hidden="true" />
          <div>
            <strong>{bookStats.newOnes} új foglalás</strong> várja, hogy megnézd.
          </div>
          <Link href="/admin/foglalasok" className="admin-btn admin-btn-primary">
            Foglalások megnyitása
          </Link>
        </div>
      )}

      <div className="admin-stats">
        <StatCard
          icon={<MapPinned size={22} />}
          label="Úticélok"
          value={destStats.total}
          hint={`Ebből ${destStats.published} publikálva`}
          href="/admin/uticelok"
        />
        <StatCard
          icon={<CalendarDays size={22} />}
          label="Jövőbeli indulások"
          value={depStats.upcoming}
          hint="Időpontok az úticélokhoz"
          href="/admin/indulasok"
        />
        <StatCard
          icon={<Mailbox size={22} />}
          label="Foglalások"
          value={bookStats.total}
          hint={`${bookStats.newOnes} új`}
          href="/admin/foglalasok"
          highlight={bookStats.newOnes > 0}
        />
      </div>

      <section className="admin-tip">
        <h2>Hasznos linkek</h2>
        <p style={{ marginBottom: 12 }}>
          A szerkesztések a Mentés gomb után 1 percen belül megjelennek a
          publikus weboldalon.
        </p>
        <div className="admin-quick-links">
          <Link href="/" target="_blank" className="admin-btn admin-btn-secondary">
            <ExternalLink size={14} /> Webhely megnyitása
          </Link>
          <Link href="/admin/oldalak" className="admin-btn admin-btn-secondary">
            Kezdőlap & Rólam szerkesztése
          </Link>
          <Link href="/admin/uticelok/uj" className="admin-btn admin-btn-secondary">
            Új úticél létrehozása
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  href,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`admin-stat-card ${highlight ? 'admin-stat-card-highlight' : ''}`}
    >
      <div className="admin-stat-icon">{icon}</div>
      <div className="admin-stat-value">{value}</div>
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-hint">{hint}</div>
    </Link>
  );
}
