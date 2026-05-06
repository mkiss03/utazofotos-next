'use client';

import { useState, useTransition, useActionState, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  Loader2,
  Trash2,
  Copy,
  Check,
  X,
  Pencil,
  ImageOff,
} from 'lucide-react';
import {
  uploadMedia,
  deleteMedia,
  updateMediaAlt,
  type UploadState,
} from './actions';

type MediaItem = {
  id: string;
  url: string;
  pathname: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  alt: string;
  createdAt: Date;
};

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, formAction] = useActionState<UploadState, FormData>(
    uploadMedia,
    { ok: false },
  );
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<MediaItem | null>(null);

  function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const fd = new FormData();
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (const f of Array.from(files)) {
      fd.append('files', f);
    }
    e.target.value = '';
    startTransition(() => formAction(fd));
  }

  return (
    <div>
      {/* Feltöltő sáv */}
      <section className="admin-section">
        <div className="admin-upload-bar">
          <button
            type="button"
            className="admin-btn admin-btn-primary admin-btn-lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 size={18} className="admin-spin" aria-hidden="true" />
                Feltöltés folyamatban…
              </>
            ) : (
              <>
                <Upload size={18} aria-hidden="true" />
                Képek feltöltése
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            style={{ display: 'none' }}
            onChange={onFilesSelected}
          />
          <p className="admin-field-hint" style={{ flex: 1, minWidth: 200 }}>
            JPG, PNG, WEBP, GIF vagy AVIF — egyenként max. 10 MB. Több fájl is
            kiválasztható egyszerre.
          </p>
        </div>
        {state.error && (
          <div
            className="admin-form-status admin-form-status-error"
            style={{ marginTop: 12 }}
          >
            {state.error}
            {state.uploaded ? ` (Eddig ${state.uploaded} fájl feltöltve.)` : ''}
          </div>
        )}
        {state.ok && state.uploaded && (
          <div
            className="admin-form-status admin-form-status-ok"
            style={{ marginTop: 12 }}
          >
            {state.uploaded} fájl sikeresen feltöltve.
          </div>
        )}
      </section>

      {/* Galéria */}
      {items.length === 0 ? (
        <div className="admin-empty">
          <p>Még nincs feltöltött kép.</p>
          <p className="admin-field-hint">
            Kattints a feltöltés gombra, és válassz fájlokat a számítógépedről.
          </p>
        </div>
      ) : (
        <div className="admin-media-grid">
          {items.map((m) => (
            <MediaTile key={m.id} item={m} onOpen={() => setSelected(m)} />
          ))}
        </div>
      )}

      {selected && (
        <MediaDetails
          item={selected}
          onClose={() => setSelected(null)}
          onDeleted={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function MediaTile({
  item,
  onOpen,
}: {
  item: MediaItem;
  onOpen: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3500);
      return;
    }
    startTransition(async () => {
      await deleteMedia(item.id);
    });
  }

  return (
    <div className="admin-media-tile-wrap">
      <button
        type="button"
        className="admin-media-tile"
        onClick={onOpen}
        aria-label={`Kép: ${item.filename}`}
      >
        <div className="admin-media-thumb">
          <Image
            src={item.url}
            alt={item.alt || item.filename}
            fill
            sizes="200px"
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        </div>
        <div className="admin-media-tile-meta">
          <span className="admin-media-tile-name" title={item.filename}>
            {item.filename}
          </span>
          <span className="admin-media-tile-size">
            {formatSize(item.sizeBytes)}
          </span>
        </div>
      </button>
      <button
        type="button"
        className={`admin-media-tile-del${confirming ? ' is-confirming' : ''}`}
        onClick={handleDelete}
        disabled={isPending}
        title={confirming ? 'Kattints újra a végleges törléshez' : 'Kép törlése'}
        aria-label="Kép törlése"
      >
        {isPending ? (
          <Loader2 size={14} className="admin-spin" aria-hidden="true" />
        ) : (
          <Trash2 size={14} aria-hidden="true" />
        )}
        {confirming && <span className="admin-media-tile-del-confirm">Megerősít</span>}
      </button>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function MediaDetails({
  item,
  onClose,
  onDeleted,
}: {
  item: MediaItem;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [alt, setAlt] = useState(item.alt);
  const [altDirty, setAltDirty] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function copyUrl() {
    navigator.clipboard.writeText(item.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function saveAlt() {
    startTransition(async () => {
      await updateMediaAlt(item.id, alt);
      setAltDirty(false);
    });
  }

  function doDelete() {
    startTransition(async () => {
      await deleteMedia(item.id);
      onDeleted();
    });
  }

  return (
    <div
      className="admin-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div className="admin-modal admin-modal-lg">
        <button
          type="button"
          className="admin-modal-close"
          aria-label="Bezárás"
          onClick={onClose}
          disabled={isPending}
        >
          <X size={18} />
        </button>
        <h2 className="admin-modal-title">Képadatok</h2>

        <div className="admin-media-detail">
          <div className="admin-media-detail-preview">
            <Image
              src={item.url}
              alt={item.alt || item.filename}
              fill
              sizes="400px"
              style={{ objectFit: 'contain' }}
              unoptimized
            />
          </div>
          <div className="admin-media-detail-fields">
            <div className="admin-field">
              <label>Fájlnév</label>
              <input type="text" value={item.filename} readOnly />
            </div>
            <div className="admin-field">
              <label>Méret / típus</label>
              <input
                type="text"
                value={`${formatSize(item.sizeBytes)} • ${item.mimeType}`}
                readOnly
              />
            </div>
            <div className="admin-field">
              <label>URL (ezt használd a borítókép vagy blokk mezőkben)</label>
              <div className="admin-field-row">
                <input type="text" value={item.url} readOnly />
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={copyUrl}
                  title="Másolás vágólapra"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'Másolva' : 'Másolás'}</span>
                </button>
              </div>
            </div>
            <div className="admin-field">
              <label htmlFor="m-alt">Alt-szöveg (akadálymentesség)</label>
              <input
                id="m-alt"
                type="text"
                value={alt}
                onChange={(e) => {
                  setAlt(e.target.value);
                  setAltDirty(true);
                }}
                maxLength={200}
                placeholder="Mit ábrázol a kép?"
              />
              {altDirty && (
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={saveAlt}
                  disabled={isPending}
                  style={{ alignSelf: 'flex-start', marginTop: 6 }}
                >
                  {isPending ? (
                    <Loader2 size={14} className="admin-spin" aria-hidden="true" />
                  ) : (
                    <Pencil size={14} aria-hidden="true" />
                  )}
                  Alt-szöveg mentése
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="admin-modal-actions">
          {confirmingDelete ? (
            <>
              <span style={{ flex: 1, color: 'var(--danger)', fontWeight: 500 }}>
                Biztosan törlöd a képet véglegesen?
              </span>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setConfirmingDelete(false)}
                disabled={isPending}
              >
                Mégse
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={doDelete}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 size={16} className="admin-spin" aria-hidden="true" />
                ) : (
                  <Trash2 size={16} aria-hidden="true" />
                )}
                Igen, törlés
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={() => setConfirmingDelete(true)}
                disabled={isPending}
              >
                <Trash2 size={16} aria-hidden="true" /> Kép törlése
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={onClose}
                disabled={isPending}
              >
                Bezárás
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
