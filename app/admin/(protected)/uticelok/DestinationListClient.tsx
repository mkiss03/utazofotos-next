'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUp,
  ArrowDown,
  Pencil,
  Eye,
  EyeOff,
  CalendarDays,
  ImageOff,
} from 'lucide-react';
import {
  moveDestinationDown,
  moveDestinationUp,
  toggleDestinationPublished,
} from './actions';

export interface AdminDestinationItem {
  id: string;
  slug: string;
  title: string;
  region: string;
  coverImageUrl: string | null;
  sortOrder: number;
  published: boolean;
  departures: { total: number; upcoming: number };
}

export function DestinationListClient({
  items,
}: {
  items: AdminDestinationItem[];
}) {
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  function run(id: string, fn: () => Promise<void>) {
    setBusyId(id);
    startTransition(async () => {
      try {
        await fn();
      } finally {
        setBusyId(null);
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="admin-empty">
        <p>Még nincs egyetlen úticél sem. Kattints a „+ Új úticél" gombra.</p>
      </div>
    );
  }

  return (
    <div className="admin-list">
      {items.map((d, i) => {
        const isFirst = i === 0;
        const isLast = i === items.length - 1;
        const isBusy = busyId === d.id && pending;
        return (
          <div
            key={d.id}
            className={`admin-list-row ${d.published ? '' : 'is-unpublished'}`}
          >
            <div className="admin-list-thumb">
              {d.coverImageUrl ? (
                <Image
                  src={d.coverImageUrl}
                  alt={d.title}
                  fill
                  sizes="120px"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="admin-list-thumb-placeholder">
                  <ImageOff size={28} />
                </div>
              )}
            </div>

            <div className="admin-list-info">
              <div className="admin-list-title">{d.title}</div>
              <div className="admin-list-meta">
                <span>{d.region}</span>
                <span className="admin-list-meta-sep">•</span>
                <span>
                  <CalendarDays
                    size={14}
                    aria-hidden="true"
                    style={{ verticalAlign: -2, marginRight: 4 }}
                  />
                  {d.departures.upcoming} jövőbeli / {d.departures.total} összesen
                </span>
                {!d.published && (
                  <>
                    <span className="admin-list-meta-sep">•</span>
                    <span className="admin-pill admin-pill-warn">Nem publikus</span>
                  </>
                )}
              </div>
            </div>

            <div className="admin-list-actions">
              {/* Sorrend gombok */}
              <div className="admin-list-order">
                <button
                  type="button"
                  className="admin-icon-btn"
                  disabled={isFirst || isBusy}
                  aria-label="Mozgatás felfelé"
                  title="Mozgatás felfelé"
                  onClick={() => run(d.id, () => moveDestinationUp(d.id))}
                >
                  <ArrowUp size={18} />
                </button>
                <button
                  type="button"
                  className="admin-icon-btn"
                  disabled={isLast || isBusy}
                  aria-label="Mozgatás lefelé"
                  title="Mozgatás lefelé"
                  onClick={() => run(d.id, () => moveDestinationDown(d.id))}
                >
                  <ArrowDown size={18} />
                </button>
              </div>

              {/* Publikálás kapcsoló */}
              <button
                type="button"
                className={`admin-icon-btn ${d.published ? '' : 'is-off'}`}
                disabled={isBusy}
                aria-label={d.published ? 'Elrejtés' : 'Publikálás'}
                title={d.published ? 'Elrejtés a látogatók elől' : 'Publikálás'}
                onClick={() =>
                  run(d.id, () =>
                    toggleDestinationPublished(d.id, !d.published),
                  )
                }
              >
                {d.published ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>

              {/* Szerkesztés */}
              <Link
                href={`/admin/uticelok/${d.slug}`}
                className="admin-btn admin-btn-secondary"
              >
                <Pencil size={16} aria-hidden="true" />
                <span>Szerkeszt</span>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
