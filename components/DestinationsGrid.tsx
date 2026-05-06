'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CalendarDays,
  MapPin,
  ArrowRight,
  Pencil,
  Image as ImageIcon,
  Search,
} from 'lucide-react';

export type GridDestination = {
  slug: string;
  title: string;
  region: string;
  excerpt: string;
  coverImage: string | null;
  nextDateLabel: string | null;
  nextDateISO: string | null;
  nextStatus: 'available' | 'few' | 'full' | null;
  nextId: string | null;
  upcomingCount: number;
};

export function DestinationsGrid({
  items,
  isAdmin,
}: {
  items: GridDestination[];
  isAdmin: boolean;
}) {
  const [region, setRegion] = useState<string>('all');
  const [query, setQuery] = useState('');

  const regions = useMemo(() => {
    const set = new Set<string>();
    for (const d of items) if (d.region) set.add(d.region);
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b, 'hu'))];
  }, [items]);

  const counts = useMemo(() => {
    const out: Record<string, number> = { all: items.length };
    for (const d of items) out[d.region] = (out[d.region] ?? 0) + 1;
    return out;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((d) => {
      if (region !== 'all' && d.region !== region) return false;
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q) ||
        d.excerpt.toLowerCase().includes(q)
      );
    });
  }, [items, region, query]);

  return (
    <>
      <div className="dest-grid-toolbar">
        <div className="dest-grid-chips" role="tablist" aria-label="Szűrés régió szerint">
          {regions.map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={region === r}
              className={`dest-grid-chip ${region === r ? 'is-active' : ''}`}
              onClick={() => setRegion(r)}
            >
              {r === 'all' ? 'Mind' : r}
              <span className="dest-grid-chip-count">{counts[r] ?? 0}</span>
            </button>
          ))}
        </div>

        <label className="dest-grid-search" aria-label="Keresés">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Keresés úticél vagy ország szerint…"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="dest-grid-empty">
          Nincs az adott szűrőre úticél. Próbáld a „Mind" gombot.
        </div>
      ) : (
        <ul className="dest-grid">
          {filtered.map((d) => (
            <DestinationTile key={d.slug} d={d} isAdmin={isAdmin} />
          ))}
        </ul>
      )}
    </>
  );
}

function DestinationTile({
  d,
  isAdmin,
}: {
  d: GridDestination;
  isAdmin: boolean;
}) {
  const isFull = d.nextStatus === 'full';
  const isFew = d.nextStatus === 'few';

  return (
    <li className="dest-tile">
      <Link
        href={`/uticelok/${d.slug}`}
        className="dest-tile-link"
        aria-label={`${d.title} – részletek`}
      >
        <div className="dest-tile-img">
          {d.coverImage ? (
            <Image
              src={d.coverImage}
              alt={d.title}
              fill
              sizes="(max-width: 720px) 92vw, (max-width: 1100px) 46vw, 32vw"
            />
          ) : (
            <div className="dest-tile-img-empty" aria-hidden="true">
              <ImageIcon strokeWidth={1} />
            </div>
          )}
          <span className="dest-tile-region">
            <MapPin size={13} aria-hidden="true" />
            {d.region}
          </span>
          {d.nextDateLabel ? (
            <span
              className={`dest-tile-pill ${
                isFull ? 'is-full' : isFew ? 'is-few' : 'is-ok'
              }`}
            >
              <CalendarDays size={13} aria-hidden="true" />
              {d.nextDateLabel}
              {d.upcomingCount > 1 && (
                <span className="dest-tile-pill-extra">+{d.upcomingCount - 1}</span>
              )}
            </span>
          ) : (
            <span className="dest-tile-pill is-empty">
              <CalendarDays size={13} aria-hidden="true" />
              Nincs időpont
            </span>
          )}
          <div className="dest-tile-overlay" aria-hidden="true" />
        </div>

        <div className="dest-tile-body">
          <h3 className="dest-tile-title">{d.title}</h3>
          <p className="dest-tile-excerpt">{d.excerpt}</p>
          <span className="dest-tile-cta">
            Részletek
            <ArrowRight size={16} aria-hidden="true" />
          </span>
        </div>
      </Link>

      {d.nextId && !isFull && (
        <Link
          href={`/jelentkezes?utazas=${d.nextId}`}
          className="dest-tile-book btn-accent"
          aria-label={`${d.title} foglalása`}
          onClick={(e) => e.stopPropagation()}
        >
          Foglalás
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      )}

      {isAdmin && (
        <Link
          href={`/admin/uticelok/${d.slug}`}
          className="dest-tile-edit"
          title={`${d.title} szerkesztése`}
          aria-label={`${d.title} szerkesztése`}
        >
          <Pencil size={14} aria-hidden="true" />
        </Link>
      )}
    </li>
  );
}
