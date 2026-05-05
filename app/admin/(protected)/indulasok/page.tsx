import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { CalendarDays, ExternalLink } from 'lucide-react';
import { db } from '@/lib/db';
import { departures, destinations } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<'available' | 'few' | 'full', string> = {
  available: 'Szabad helyek',
  few: 'Utolsó helyek',
  full: 'Megtelt',
};

export default async function IndulasokPage() {
  const today = new Date().toISOString().slice(0, 10);

  const rows = await db
    .select({
      id: departures.id,
      dateISO: departures.dateISO,
      dateLabel: departures.dateLabel,
      monthShort: departures.monthShort,
      day: departures.day,
      durationDays: departures.durationDays,
      priceFrom: departures.priceFrom,
      status: departures.status,
      note: departures.note,
      destinationTitle: destinations.title,
      destinationSlug: destinations.slug,
      destinationPublished: destinations.published,
    })
    .from(departures)
    .innerJoin(destinations, eq(destinations.id, departures.destinationId))
    .orderBy(asc(departures.dateISO));

  const upcoming = rows.filter((r) => r.dateISO >= today);
  const past = rows.filter((r) => r.dateISO < today);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Indulások</h1>
        <p className="admin-page-sub">
          Itt látod az összes indulást egy helyen. A szerkesztéshez kattints az
          úticél nevére — ott tudod hozzáadni, módosítani vagy törölni az
          indulásokat.
        </p>
      </header>

      <section className="admin-section">
        <h2 className="admin-section-title">
          Jövőbeli indulások ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <p className="admin-section-hint">
            Jelenleg nincs jövőbeli indulás. Az úticél szerkesztő oldalán tudsz
            újat hozzáadni.
          </p>
        ) : (
          <DeparturesTable rows={upcoming} />
        )}
      </section>

      {past.length > 0 && (
        <section className="admin-section">
          <h2 className="admin-section-title">
            Múltbeli indulások ({past.length})
          </h2>
          <DeparturesTable rows={past} dimmed />
        </section>
      )}
    </div>
  );
}

type Row = {
  id: string;
  dateISO: string;
  dateLabel: string;
  monthShort: string;
  day: string;
  durationDays: number | null;
  priceFrom: string | null;
  status: 'available' | 'few' | 'full';
  note: string | null;
  destinationTitle: string;
  destinationSlug: string;
  destinationPublished: boolean;
};

function DeparturesTable({ rows, dimmed }: { rows: Row[]; dimmed?: boolean }) {
  return (
    <ul
      className="admin-departure-list"
      style={dimmed ? { opacity: 0.65 } : undefined}
    >
      {rows.map((r) => (
        <li key={r.id} className="admin-departure-item">
          <div className="admin-departure-row">
            <div className="admin-departure-badge">
              <span className="admin-departure-month">{r.monthShort}</span>
              <span className="admin-departure-day">{r.day}</span>
            </div>
            <div className="admin-departure-info">
              <div className="admin-departure-label">
                <CalendarDays size={14} aria-hidden="true" />
                <strong>{r.destinationTitle}</strong>
                {!r.destinationPublished && (
                  <span className="admin-pill admin-pill-warn">Nem publikus</span>
                )}
              </div>
              <div className="admin-departure-meta">
                <span>{r.dateLabel}</span>
                <span
                  className={`admin-pill ${
                    r.status === 'available'
                      ? 'admin-pill-ok'
                      : r.status === 'few'
                      ? 'admin-pill-warn'
                      : 'admin-pill-danger'
                  }`}
                >
                  {STATUS_LABEL[r.status]}
                </span>
                {r.priceFrom && <span>{r.priceFrom}</span>}
                {r.durationDays && <span>{r.durationDays} napos</span>}
                {r.note && <span>📝 {r.note}</span>}
              </div>
            </div>
            <Link
              href={`/admin/uticelok/${r.destinationSlug}`}
              className="admin-btn admin-btn-secondary"
            >
              <ExternalLink size={14} aria-hidden="true" />
              <span>Szerkesztés</span>
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
