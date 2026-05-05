import Link from 'next/link';
import { CalendarDays, Clock, CheckCircle2, AlertCircle, XCircle, Info, History } from 'lucide-react';
import {
  type Destination,
  type Departure,
  statusLabel,
} from '@/lib/destinations';

function StatusBadge({ status, isPast }: { status: Departure['status']; isPast?: boolean }) {
  if (isPast) {
    return (
      <span className="dep-status past">
        <History size={14} aria-hidden="true" />
        Lejárt időpont
      </span>
    );
  }
  const Icon =
    status === 'available' ? CheckCircle2 : status === 'few' ? AlertCircle : XCircle;
  return (
    <span className={`dep-status ${status}`}>
      <Icon size={14} aria-hidden="true" />
      {statusLabel(status)}
    </span>
  );
}

export function DepartureList({ destination }: { destination: Destination }) {
  if (destination.departures.length === 0) {
    return (
      <section className="dep-section" aria-labelledby="dep-title">
        <h2 id="dep-title" className="dep-section-title">
          Indulási időpontok
        </h2>
        <p className="dep-section-sub">Jelenleg nincs meghirdetett időpont.</p>
      </section>
    );
  }

  // Jövőbelieket előre, lejárt időpontokat utánuk – disabled állapotban.
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const all = [...destination.departures].sort((a, b) =>
    a.dateISO.localeCompare(b.dateISO),
  );
  const upcoming = all.filter((d) => new Date(d.dateISO) >= today);
  const past = all.filter((d) => new Date(d.dateISO) < today).reverse();
  const sorted = [...upcoming, ...past];

  return (
    <section className="dep-section" aria-labelledby="dep-title">
      <h2 id="dep-title" className="dep-section-title">
        Válassz indulási időpontot
      </h2>
      <p className="dep-section-sub">
        {upcoming.length === 0
          ? 'Jelenleg nincs meghirdetett új időpont. Az alábbi időpontok már lejártak.'
          : upcoming.length === 1
            ? 'Egy időpont érhető el. Kattints a foglaláshoz, vagy hívj telefonon.'
            : `${upcoming.length} időpont érhető el – válaszd ki, melyikre szeretnél jönni.`}
      </p>
      <ul className="dep-list" style={{ listStyle: 'none' }}>
        {sorted.map((dep) => {
          const isPast = new Date(dep.dateISO) < today;
          return (
          <li key={dep.id} className={`dep-card ${dep.status}${isPast ? ' is-past' : ''}`}>
            <div className="dep-date-badge" aria-hidden="true">
              <span className="dep-date-month">{dep.monthShort}</span>
              <span className="dep-date-day">{dep.day}</span>
            </div>
            <div className="dep-info">
              <div className="dep-info-date">
                <CalendarDays
                  size={16}
                  aria-hidden="true"
                  style={{ display: 'inline', marginRight: 6, verticalAlign: -2, color: 'var(--accent)' }}
                />
                {dep.dateLabel}
              </div>
              <div className="dep-info-meta">
                {dep.durationDays && (
                  <span>
                    <Clock size={14} aria-hidden="true" />
                    {dep.durationDays} nap
                  </span>
                )}
                {dep.priceFrom && <span>Ártól: {dep.priceFrom}</span>}
                {dep.note && (
                  <span>
                    <Info size={14} aria-hidden="true" />
                    {dep.note}
                  </span>
                )}
              </div>
              <StatusBadge status={dep.status} isPast={isPast} />
            </div>
            <div className="dep-action">
              {isPast ? (
                <span
                  className="btn-outline-dark"
                  aria-disabled="true"
                  style={{ pointerEvents: 'none', opacity: 0.5 }}
                >
                  Lejárt
                </span>
              ) : dep.status === 'full' ? (
                <span
                  className="btn-outline-dark"
                  aria-disabled="true"
                  style={{ pointerEvents: 'none', opacity: 0.6 }}
                >
                  Betelt
                </span>
              ) : (
                <Link
                  href={`/jelentkezes?utazas=${dep.id}`}
                  className="btn-accent"
                  aria-label={`Foglalom ezt az időpontot: ${dep.dateLabel}`}
                >
                  Foglalom ezt
                </Link>
              )}
            </div>
          </li>
          );
        })}
      </ul>
    </section>
  );
}
