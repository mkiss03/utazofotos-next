'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Plane,
  Bus,
  CalendarDays,
  Clock,
  MapPin,
  ArrowRight,
  X,
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

const DOW_HU = ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'];

interface Props {
  entries: ScheduleEntry[];
}

type Transport = 'plane' | 'bus';

function detectTransport(e: ScheduleEntry): Transport {
  const note = (e.note ?? '').toLowerCase();
  if (note.includes('busz') || note.includes('autóbusz')) return 'bus';
  return 'plane';
}

function TransportIcon({
  mode,
  size = 14,
}: {
  mode: Transport;
  size?: number;
}) {
  return mode === 'bus' ? (
    <Bus size={size} aria-label="Autóbuszos" />
  ) : (
    <Plane size={size} aria-label="Repülős" />
  );
}

function parseISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m: m - 1, d };
}

function daysInMonth(year: number, monthIdx: number) {
  return new Date(year, monthIdx + 1, 0).getDate();
}

function firstWeekdayMon(year: number, monthIdx: number) {
  const js = new Date(year, monthIdx, 1).getDay();
  return (js + 6) % 7; // 0 = hétfő
}

function todayISO() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

function isoFor(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function formatDayHu(iso: string) {
  const { y, m, d } = parseISO(iso);
  return `${y}. ${MONTHS_HU[m].toLowerCase()} ${d}.`;
}

function bestStatus(list: ScheduleEntry[]): 'available' | 'few' | 'full' {
  if (list.some((e) => e.status === 'available')) return 'available';
  if (list.some((e) => e.status === 'few')) return 'few';
  return 'full';
}

export function ScheduleCalendar({ entries }: Props) {
  const years = useMemo(() => {
    const set = new Set(entries.map((e) => e.dateISO.slice(0, 4)));
    if (set.size === 0) set.add(String(new Date().getFullYear()));
    return [...set].sort();
  }, [entries]);

  const initialYear = useMemo(() => {
    const today = todayISO();
    const upcoming = entries
      .filter((e) => e.dateISO >= today)
      .map((e) => e.dateISO.slice(0, 4));
    if (upcoming.length > 0) return upcoming.sort()[0];
    return years[years.length - 1] ?? String(new Date().getFullYear());
  }, [entries, years]);

  const [yearStr, setYearStr] = useState<string>(initialYear);
  const year = parseInt(yearStr, 10);
  const [selectedISO, setSelectedISO] = useState<string | null>(null);

  const yearEntries = useMemo(
    () => entries.filter((e) => e.dateISO.startsWith(yearStr)),
    [entries, yearStr],
  );

  const todayStr = todayISO();
  const upcomingCount = yearEntries.filter((e) => !e.isPast).length;

  const byDate = useMemo(() => {
    const map = new Map<string, ScheduleEntry[]>();
    for (const e of yearEntries) {
      const arr = map.get(e.dateISO) ?? [];
      arr.push(e);
      map.set(e.dateISO, arr);
    }
    return map;
  }, [yearEntries]);

  const detailEntries = useMemo(() => {
    if (selectedISO) {
      return (byDate.get(selectedISO) ?? []).slice();
    }
    return yearEntries
      .filter((e) => !e.isPast)
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
      .slice(0, 3);
  }, [byDate, selectedISO, yearEntries]);

  const detailTitle = selectedISO
    ? formatDayHu(selectedISO)
    : 'Következő indulások';

  return (
    <div className="cal2">
      <div className="cal2-toolbar">
        <div className="cal2-years" role="tablist" aria-label="Év">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              role="tab"
              aria-selected={y === yearStr}
              className={`cal2-year ${y === yearStr ? 'is-active' : ''}`}
              onClick={() => {
                setYearStr(y);
                setSelectedISO(null);
              }}
            >
              {y}
            </button>
          ))}
        </div>
        <div className="cal2-legend" aria-hidden="true">
          <span className="cal2-legend-item">
            <span className="cal2-dot is-ok" />
            Szabad
          </span>
          <span className="cal2-legend-item">
            <span className="cal2-dot is-few" />
            Kevés
          </span>
          <span className="cal2-legend-item">
            <span className="cal2-dot is-full" />
            Betelt
          </span>
          <span className="cal2-legend-sep" />
          <span className="cal2-legend-item">
            <Plane size={14} />
            Repülő
          </span>
          <span className="cal2-legend-item">
            <Bus size={14} />
            Busz
          </span>
        </div>
      </div>

      <div className="cal2-summary">
        <CalendarDays size={18} />
        <span>
          <strong>{yearStr}</strong> — {upcomingCount} elérhető indulás
        </span>
      </div>

      <div className="cal2-grid">
        {Array.from({ length: 12 }, (_, m) => (
          <MiniMonth
            key={m}
            year={year}
            monthIdx={m}
            byDate={byDate}
            todayISO={todayStr}
            selectedISO={selectedISO}
            onSelect={setSelectedISO}
          />
        ))}
      </div>

      <DetailPanel
        title={detailTitle}
        entries={detailEntries}
        clearable={!!selectedISO}
        onClear={() => setSelectedISO(null)}
      />
    </div>
  );
}

function MiniMonth({
  year,
  monthIdx,
  byDate,
  todayISO,
  selectedISO,
  onSelect,
}: {
  year: number;
  monthIdx: number;
  byDate: Map<string, ScheduleEntry[]>;
  todayISO: string;
  selectedISO: string | null;
  onSelect: (iso: string | null) => void;
}) {
  const total = daysInMonth(year, monthIdx);
  const lead = firstWeekdayMon(year, monthIdx);
  const cells: Array<number | null> = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  let monthCount = 0;
  for (let d = 1; d <= total; d++) {
    monthCount += byDate.get(isoFor(year, monthIdx, d))?.length ?? 0;
  }
  const isEmpty = monthCount === 0;

  return (
    <section className={`cal2-month ${isEmpty ? 'is-empty' : ''}`}>
      <header className="cal2-month-head">
        <span className="cal2-month-name">{MONTHS_HU[monthIdx]}</span>
        {monthCount > 0 && (
          <span className="cal2-month-count">{monthCount}</span>
        )}
      </header>
      <div className="cal2-dow" aria-hidden="true">
        {DOW_HU.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="cal2-cells">
        {cells.map((d, i) => {
          if (d === null) return <span key={i} className="cal2-cell is-blank" />;
          const iso = isoFor(year, monthIdx, d);
          const list = byDate.get(iso);
          const has = !!list && list.length > 0;
          const isPast = iso < todayISO;
          const isToday = iso === todayISO;
          const isSelected = iso === selectedISO;

          if (!has) {
            return (
              <span
                key={i}
                className={`cal2-cell ${isToday ? 'is-today' : ''} ${isPast ? 'is-past' : ''}`}
              >
                {d}
              </span>
            );
          }
          const status = bestStatus(list!);
          const transport = detectTransport(list![0]);
          return (
            <button
              key={i}
              type="button"
              className={`cal2-cell has-event status-${status} ${isPast ? 'is-past' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onSelect(isSelected ? null : iso)}
              aria-label={`${d}. – ${list!.length} indulás`}
              aria-pressed={isSelected}
            >
              <span className="cal2-cell-num">{d}</span>
              <span className="cal2-cell-icon">
                <TransportIcon mode={transport} size={11} />
              </span>
              {list!.length > 1 && (
                <span className="cal2-cell-badge">{list!.length}</span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DetailPanel({
  title,
  entries,
  clearable,
  onClear,
}: {
  title: string;
  entries: ScheduleEntry[];
  clearable: boolean;
  onClear: () => void;
}) {
  return (
    <div className="cal2-panel" aria-live="polite">
      <header className="cal2-panel-head">
        <h3>{title}</h3>
        {clearable && (
          <button
            type="button"
            className="cal2-panel-close"
            onClick={onClear}
            aria-label="Kijelölés törlése"
          >
            <X size={16} />
          </button>
        )}
      </header>
      {entries.length === 0 ? (
        <div className="cal2-panel-empty">
          Nincs erre a napra meghirdetett indulás.
        </div>
      ) : (
        <ul className="cal2-panel-list">
          {entries.map((e) => {
            const transport = detectTransport(e);
            const isFull = e.status === 'full';
            return (
              <li
                key={e.id}
                className={`cal2-panel-item status-${e.status} ${e.isPast ? 'is-past' : ''}`}
              >
                <div className="cal2-panel-icon">
                  <TransportIcon mode={transport} size={22} />
                </div>
                <div className="cal2-panel-body">
                  <Link
                    href={`/uticelok/${e.destinationSlug}`}
                    className="cal2-panel-title"
                  >
                    {e.destinationTitle}
                  </Link>
                  <div className="cal2-panel-meta">
                    <span>
                      <CalendarDays size={13} />
                      {e.dateLabel}
                    </span>
                    <span>
                      <MapPin size={13} />
                      {e.region}
                    </span>
                    {e.durationDays && (
                      <span>
                        <Clock size={13} />
                        {e.durationDays} nap
                      </span>
                    )}
                  </div>
                  {e.note && <p className="cal2-panel-note">{e.note}</p>}
                </div>
                <div className="cal2-panel-cta">
                  <StatusPill status={e.status} isPast={e.isPast} />
                  {e.isPast ? (
                    <span className="cal2-panel-disabled">Lejárt</span>
                  ) : isFull ? (
                    <span className="cal2-panel-disabled">Betelt</span>
                  ) : (
                    <Link
                      href={`/jelentkezes?utazas=${e.id}`}
                      className="btn-accent cal2-panel-book"
                    >
                      Foglalás
                      <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatusPill({
  status,
  isPast,
}: {
  status: ScheduleEntry['status'];
  isPast: boolean;
}) {
  if (isPast) return <span className="cal2-pill is-past">Lejárt</span>;
  if (status === 'full') return <span className="cal2-pill is-full">Betelt</span>;
  if (status === 'few') return <span className="cal2-pill is-few">Kevés hely</span>;
  return <span className="cal2-pill is-ok">Szabad helyek</span>;
}
