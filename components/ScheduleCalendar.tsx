'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  MapPin,
  ArrowRight,
  CalendarCheck,
} from 'lucide-react';

export interface ScheduleEntry {
  id: string;
  destinationSlug: string;
  destinationTitle: string;
  region: string;
  dateISO: string;
  dateLabel: string;
  monthShort: string;
  day: string;
  durationDays?: number;
  priceFrom?: string;
  status: 'available' | 'few' | 'full';
  note?: string;
  isPast: boolean;
}

const MONTHS_HU = [
  'Január',
  'Február',
  'Március',
  'Április',
  'Május',
  'Június',
  'Július',
  'Augusztus',
  'Szeptember',
  'Október',
  'November',
  'December',
];

interface Props {
  entries: ScheduleEntry[];
}

export function ScheduleCalendar({ entries }: Props) {
  // Évek meghatározása az adatokból
  const years = useMemo(() => {
    const set = new Set(entries.map((e) => e.dateISO.slice(0, 4)));
    return [...set].sort();
  }, [entries]);

  // Default: legkorábbi év, amelyikben még van jövőbeli indulás, különben a legnagyobb
  const initialYear = useMemo(() => {
    const todayISO = new Date().toISOString().slice(0, 10);
    const upcomingYears = entries
      .filter((e) => e.dateISO >= todayISO)
      .map((e) => e.dateISO.slice(0, 4));
    if (upcomingYears.length > 0) {
      return upcomingYears.sort()[0];
    }
    return years[years.length - 1] ?? String(new Date().getFullYear());
  }, [entries, years]);

  const [year, setYear] = useState<string>(initialYear);
  const [showPast, setShowPast] = useState(false);

  const yearEntries = useMemo(
    () => entries.filter((e) => e.dateISO.startsWith(year)),
    [entries, year],
  );

  const visibleEntries = useMemo(
    () => (showPast ? yearEntries : yearEntries.filter((e) => !e.isPast)),
    [yearEntries, showPast],
  );

  const upcomingCount = yearEntries.filter((e) => !e.isPast).length;
  const pastCount = yearEntries.length - upcomingCount;

  // Hónap szerinti csoportosítás
  const months = useMemo(() => {
    const map = new Map<number, ScheduleEntry[]>();
    for (const e of visibleEntries) {
      const m = parseInt(e.dateISO.slice(5, 7), 10) - 1;
      const arr = map.get(m) ?? [];
      arr.push(e);
      map.set(m, arr);
    }
    // Sorrend: hónapok növekvően; hónapon belül dátum szerint
    return [...map.entries()]
      .sort(([a], [b]) => a - b)
      .map(([m, arr]) => ({
        idx: m,
        name: MONTHS_HU[m],
        entries: arr.sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
      }));
  }, [visibleEntries]);

  if (years.length === 0) {
    return (
      <div className="sched-cal-empty">
        <CalendarDays size={32} aria-hidden="true" />
        <p>Jelenleg nincs meghirdetett indulási időpont.</p>
      </div>
    );
  }

  return (
    <div className="sched-cal">
      {/* Eszköztár: év tabok + lejárt kapcsoló */}
      <div className="sched-cal-toolbar">
        <div className="sched-cal-years" role="tablist" aria-label="Év választása">
          {years.map((y) => (
            <button
              key={y}
              role="tab"
              aria-selected={y === year}
              className={`sched-cal-year ${y === year ? 'is-active' : ''}`}
              onClick={() => setYear(y)}
              type="button"
            >
              {y}
            </button>
          ))}
        </div>
        {pastCount > 0 && (
          <label className="sched-cal-toggle">
            <input
              type="checkbox"
              checked={showPast}
              onChange={(e) => setShowPast(e.target.checked)}
            />
            <span>Lejárt időpontok mutatása ({pastCount})</span>
          </label>
        )}
      </div>

      {/* Összefoglaló sáv */}
      <div className="sched-cal-summary">
        <CalendarCheck size={18} aria-hidden="true" />
        <span>
          <strong>{year}</strong> — {upcomingCount}{' '}
          {upcomingCount === 1 ? 'elérhető időpont' : 'elérhető időpont'}
          {showPast && pastCount > 0 ? ` + ${pastCount} lejárt` : ''}
        </span>
      </div>

      {/* Hónapok */}
      {months.length === 0 ? (
        <div className="sched-cal-empty">
          <CalendarDays size={32} aria-hidden="true" />
          <p>
            Nincs {showPast ? '' : 'elérhető '}időpont {year}-ben.
          </p>
        </div>
      ) : (
        <div className="sched-cal-months">
          {months.map((m) => (
            <section key={m.idx} className="sched-cal-month">
              <header className="sched-cal-month-head">
                <span className="sched-cal-month-name">{m.name}</span>
                <span className="sched-cal-month-count">
                  {m.entries.length}{' '}
                  {m.entries.length === 1 ? 'időpont' : 'időpont'}
                </span>
              </header>
              <ul className="sched-cal-list">
                {m.entries.map((e) => (
                  <ScheduleRow key={e.id} entry={e} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function ScheduleRow({ entry }: { entry: ScheduleEntry }) {
  const endLabel = computeEndLabel(entry);
  const isFull = entry.status === 'full';

  return (
    <li
      className={`sched-cal-row status-${entry.status}${entry.isPast ? ' is-past' : ''}`}
    >
      <div className="sched-cal-day" aria-hidden="true">
        <span className="sched-cal-day-num">{entry.day}</span>
        {endLabel && <span className="sched-cal-day-end">{endLabel}</span>}
      </div>
      <div className="sched-cal-main">
        <Link
          href={`/uticelok/${entry.destinationSlug}`}
          className="sched-cal-title"
        >
          {entry.destinationTitle}
        </Link>
        <div className="sched-cal-meta">
          <span>
            <MapPin size={13} aria-hidden="true" />
            {entry.region}
          </span>
          <span>
            <CalendarDays size={13} aria-hidden="true" />
            {entry.dateLabel}
          </span>
          {entry.durationDays && (
            <span>
              <Clock size={13} aria-hidden="true" />
              {entry.durationDays} nap
            </span>
          )}
        </div>
        {entry.note && <p className="sched-cal-note">{entry.note}</p>}
      </div>
      <div className="sched-cal-status">
        <StatusPill status={entry.status} isPast={entry.isPast} />
      </div>
      <div className="sched-cal-cta">
        {entry.isPast ? (
          <span className="sched-cal-disabled">Lejárt</span>
        ) : isFull ? (
          <span className="sched-cal-disabled">Betelt</span>
        ) : (
          <Link
            href={`/jelentkezes?utazas=${entry.id}`}
            className="btn-accent sched-cal-book"
            aria-label={`Foglalás: ${entry.destinationTitle}, ${entry.dateLabel}`}
          >
            Foglalás
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>
    </li>
  );
}

function computeEndLabel(e: ScheduleEntry): string | null {
  if (!e.durationDays || e.durationDays <= 1) return null;
  const start = new Date(e.dateISO);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start);
  end.setDate(end.getDate() + e.durationDays - 1);
  // Csak hónap-nap, ugyanazon hónapon belül csak a napot
  const sameMonth = end.getMonth() === start.getMonth();
  const day = String(end.getDate()).padStart(2, '0');
  if (sameMonth) return `– ${day}.`;
  const m = MONTHS_HU[end.getMonth()].slice(0, 3).toLowerCase();
  return `– ${m} ${day}.`;
}

function StatusPill({
  status,
  isPast,
}: {
  status: ScheduleEntry['status'];
  isPast: boolean;
}) {
  if (isPast) {
    return <span className="sched-cal-pill is-past">Lejárt</span>;
  }
  if (status === 'full') {
    return <span className="sched-cal-pill is-full">Betelt</span>;
  }
  if (status === 'few') {
    return <span className="sched-cal-pill is-few">Kevés hely</span>;
  }
  return <span className="sched-cal-pill is-ok">Szabad helyek</span>;
}
