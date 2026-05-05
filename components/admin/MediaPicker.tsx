'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, X, Loader2, Search } from 'lucide-react';
import { listMediaForPicker } from './media-picker-actions';

type PickerItem = {
  id: string;
  url: string;
  filename: string;
  alt: string;
  sizeBytes: number;
};

export type MediaPickerSelection = {
  url: string;
  alt: string;
};

/**
 * Gomb, amely megnyit egy modálist a médiatár képeivel.
 * Kiválasztáskor visszahívja az `onPick` callback-et az URL-lel és alt-tal.
 *
 * Senior-friendly: nagy kártyák, egy kattintásos kiválasztás, kereső a fájlnévre.
 */
export function MediaPicker({
  onPick,
  buttonLabel = 'Választás médiatárból',
}: {
  onPick: (sel: MediaPickerSelection) => void;
  buttonLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="admin-btn admin-btn-secondary"
        onClick={() => setOpen(true)}
      >
        <ImagePlus size={16} aria-hidden="true" />
        <span>{buttonLabel}</span>
      </button>
      {open && (
        <PickerModal
          onClose={() => setOpen(false)}
          onPick={(sel) => {
            onPick(sel);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

function PickerModal({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (sel: MediaPickerSelection) => void;
}) {
  const [items, setItems] = useState<PickerItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    let alive = true;
    listMediaForPicker()
      .then((rows) => {
        if (alive) setItems(rows);
      })
      .catch((e) => {
        if (alive) setError('A médiatár betöltése nem sikerült.');
      });
    return () => {
      alive = false;
    };
  }, []);

  const filtered =
    items?.filter((it) =>
      it.filename.toLowerCase().includes(filter.toLowerCase()),
    ) ?? null;

  return (
    <div
      className="admin-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="admin-modal admin-modal-lg">
        <button
          type="button"
          className="admin-modal-close"
          aria-label="Bezárás"
          onClick={onClose}
        >
          <X size={18} />
        </button>
        <h2 className="admin-modal-title">Kép választása a médiatárból</h2>

        <div className="admin-picker-search">
          <Search size={16} aria-hidden="true" />
          <input
            type="text"
            placeholder="Keresés fájlnév szerint…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            autoFocus
          />
        </div>

        {error && (
          <div className="admin-form-status admin-form-status-error">
            {error}
          </div>
        )}

        {!items && !error && (
          <div className="admin-picker-loading">
            <Loader2 size={20} className="admin-spin" aria-hidden="true" />
            <span>Médiatár betöltése…</span>
          </div>
        )}

        {filtered && filtered.length === 0 && (
          <div className="admin-empty" style={{ marginTop: 12 }}>
            <p>
              {items && items.length === 0
                ? 'A médiatár üres. Tölts fel képeket a /admin/media oldalon.'
                : 'Nincs találat erre a keresésre.'}
            </p>
          </div>
        )}

        {filtered && filtered.length > 0 && (
          <div className="admin-picker-grid">
            {filtered.map((it) => (
              <button
                key={it.id}
                type="button"
                className="admin-picker-tile"
                onClick={() => onPick({ url: it.url, alt: it.alt })}
                title={`Kiválasztás: ${it.filename}`}
              >
                <div className="admin-media-thumb">
                  <Image
                    src={it.url}
                    alt={it.alt || it.filename}
                    fill
                    sizes="160px"
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                </div>
                <span className="admin-picker-tile-name" title={it.filename}>
                  {it.filename}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
