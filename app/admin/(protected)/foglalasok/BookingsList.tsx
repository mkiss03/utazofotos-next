'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  Calendar,
  ChevronDown,
  ChevronUp,
  Trash2,
  Loader2,
  ExternalLink,
  Save,
} from 'lucide-react';
import {
  updateBookingStatus,
  updateBookingNote,
  deleteBooking,
} from './actions';

type Status = 'new' | 'contacted' | 'confirmed' | 'cancelled';

type BookingRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  adminNote: string;
  status: Status;
  createdAt: string; // ISO
  snapshotDestinationTitle: string | null;
  snapshotDateLabel: string | null;
  departureId: string | null;
  currentDestSlug: string | null;
  currentDestTitle: string | null;
  currentDateLabel: string | null;
};

const STATUS_LABEL: Record<Status, string> = {
  new: 'Új',
  contacted: 'Felvettük a kapcsolatot',
  confirmed: 'Megerősítve',
  cancelled: 'Lemondva',
};

const STATUS_FILTERS: { value: Status | 'all'; label: string }[] = [
  { value: 'all', label: 'Mind' },
  { value: 'new', label: 'Új' },
  { value: 'contacted', label: 'Kapcsolatban' },
  { value: 'confirmed', label: 'Megerősítve' },
  { value: 'cancelled', label: 'Lemondva' },
];

export function BookingsList({ items }: { items: BookingRow[] }) {
  const [filter, setFilter] = useState<Status | 'all'>('all');

  const counts = useMemo(() => {
    const out: Record<string, number> = {
      all: items.length,
      new: 0,
      contacted: 0,
      confirmed: 0,
      cancelled: 0,
    };
    for (const it of items) out[it.status]++;
    return out;
  }, [items]);

  const filtered = filter === 'all' ? items : items.filter((it) => it.status === filter);

  return (
    <>
      <div className="admin-bookings-filters">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`admin-filter-btn ${filter === f.value ? 'is-active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
            <span className="admin-filter-count">{counts[f.value]}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="admin-empty">
          <p>
            {items.length === 0
              ? 'Még nem érkezett foglalás.'
              : 'Nincs ebben a kategóriában foglalás.'}
          </p>
        </div>
      ) : (
        <ul className="admin-bookings-list">
          {filtered.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </ul>
      )}
    </>
  );
}

function BookingCard({ booking }: { booking: BookingRow }) {
  const [open, setOpen] = useState(booking.status === 'new');
  const [status, setStatus] = useState<Status>(booking.status);
  const [note, setNote] = useState(booking.adminNote);
  const [noteDirty, setNoteDirty] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const created = new Date(booking.createdAt);
  const createdHu = created.toLocaleString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const destTitle = booking.currentDestTitle ?? booking.snapshotDestinationTitle;
  const dateLabel = booking.currentDateLabel ?? booking.snapshotDateLabel;
  const isOrphan =
    booking.departureId === null || booking.currentDestSlug === null;

  function changeStatus(next: Status) {
    setStatus(next);
    startTransition(async () => {
      try {
        await updateBookingStatus(booking.id, next);
      } catch {
        setStatus(booking.status);
      }
    });
  }

  function saveNote() {
    startTransition(async () => {
      await updateBookingNote(booking.id, note);
      setNoteDirty(false);
    });
  }

  function doDelete() {
    startTransition(async () => {
      await deleteBooking(booking.id);
    });
  }

  return (
    <li className={`admin-booking admin-booking-${status}`}>
      <button
        type="button"
        className="admin-booking-header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="admin-booking-header-info">
          <div className="admin-booking-name">
            {booking.name}
            <span className={`admin-pill admin-pill-${status}`}>
              {STATUS_LABEL[status]}
            </span>
          </div>
          <div className="admin-booking-summary">
            <span>{destTitle ?? '—'}</span>
            {dateLabel && (
              <>
                <span>•</span>
                <span>{dateLabel}</span>
              </>
            )}
            <span>•</span>
            <span>{createdHu}</span>
          </div>
        </div>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && (
        <div className="admin-booking-body">
          <div className="admin-booking-grid">
            <div className="admin-booking-fields">
              <Field label="E-mail" icon={<Mail size={14} />}>
                <a href={`mailto:${booking.email}`}>{booking.email}</a>
              </Field>
              <Field label="Telefon" icon={<Phone size={14} />}>
                <a href={`tel:${booking.phone}`}>{booking.phone}</a>
              </Field>
              <Field label="Időpont" icon={<Calendar size={14} />}>
                {destTitle && booking.currentDestSlug ? (
                  <Link
                    href={`/admin/uticelok/${booking.currentDestSlug}`}
                    className="admin-link"
                  >
                    {destTitle} – {dateLabel}
                    <ExternalLink size={12} aria-hidden="true" />
                  </Link>
                ) : (
                  <span>
                    {destTitle ?? '—'} {dateLabel ? `– ${dateLabel}` : ''}
                    {isOrphan && (
                      <span className="admin-pill admin-pill-warn" style={{ marginLeft: 8 }}>
                        Indulás törölve
                      </span>
                    )}
                  </span>
                )}
              </Field>
              {booking.message && (
                <Field label="Megjegyzés a vendégtől">
                  <p className="admin-booking-message">{booking.message}</p>
                </Field>
              )}
            </div>

            <div className="admin-booking-controls">
              <div className="admin-field">
                <label>Státusz</label>
                <select
                  value={status}
                  onChange={(e) => changeStatus(e.target.value as Status)}
                  disabled={isPending}
                >
                  {(['new', 'contacted', 'confirmed', 'cancelled'] as Status[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label>Belső jegyzet (csak admin látja)</label>
                <textarea
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                    setNoteDirty(true);
                  }}
                  rows={4}
                  placeholder="Pl. felhívtam, várja a visszaigazolást"
                />
                {noteDirty && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={saveNote}
                    disabled={isPending}
                    style={{ alignSelf: 'flex-start', marginTop: 4 }}
                  >
                    {isPending ? (
                      <Loader2 size={14} className="admin-spin" aria-hidden="true" />
                    ) : (
                      <Save size={14} aria-hidden="true" />
                    )}
                    Jegyzet mentése
                  </button>
                )}
              </div>
              <div className="admin-booking-danger">
                {confirmingDelete ? (
                  <>
                    <span style={{ color: 'var(--danger)', fontWeight: 500 }}>
                      Biztosan törlöd?
                    </span>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      onClick={doDelete}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 size={14} className="admin-spin" aria-hidden="true" />
                      ) : (
                        <Trash2 size={14} aria-hidden="true" />
                      )}
                      Igen, törlés
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={() => setConfirmingDelete(false)}
                      disabled={isPending}
                    >
                      Mégse
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    Foglalás törlése
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-booking-field">
      <span className="admin-booking-field-label">
        {icon}
        {label}
      </span>
      <div className="admin-booking-field-value">{children}</div>
    </div>
  );
}
