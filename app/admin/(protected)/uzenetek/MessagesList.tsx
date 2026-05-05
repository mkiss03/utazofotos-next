'use client';

import { useState, useTransition, useMemo } from 'react';
import {
  Mail,
  ChevronDown,
  ChevronUp,
  Trash2,
  Loader2,
  Save,
} from 'lucide-react';
import {
  updateContactMessageStatus,
  updateContactMessageNote,
  deleteContactMessage,
} from './actions';

type Status = 'new' | 'replied' | 'archived';

type MessageRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  adminNote: string;
  status: Status;
  createdAt: string;
};

const STATUS_LABEL: Record<Status, string> = {
  new: 'Új',
  replied: 'Megválaszolva',
  archived: 'Archiválva',
};

const STATUS_FILTERS: { value: Status | 'all'; label: string }[] = [
  { value: 'all', label: 'Mind' },
  { value: 'new', label: 'Új' },
  { value: 'replied', label: 'Megválaszolva' },
  { value: 'archived', label: 'Archiválva' },
];

export function MessagesList({ items }: { items: MessageRow[] }) {
  const [filter, setFilter] = useState<Status | 'all'>('all');

  const counts = useMemo(() => {
    const out: Record<string, number> = {
      all: items.length,
      new: 0,
      replied: 0,
      archived: 0,
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
              ? 'Még nem érkezett üzenet.'
              : 'Nincs ebben a kategóriában üzenet.'}
          </p>
        </div>
      ) : (
        <ul className="admin-bookings-list">
          {filtered.map((m) => (
            <MessageCard key={m.id} message={m} />
          ))}
        </ul>
      )}
    </>
  );
}

function MessageCard({ message }: { message: MessageRow }) {
  const [open, setOpen] = useState(message.status === 'new');
  const [status, setStatus] = useState<Status>(message.status);
  const [note, setNote] = useState(message.adminNote);
  const [noteDirty, setNoteDirty] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const created = new Date(message.createdAt);
  const createdHu = created.toLocaleString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  function changeStatus(next: Status) {
    setStatus(next);
    startTransition(async () => {
      try {
        await updateContactMessageStatus(message.id, next);
      } catch {
        setStatus(message.status);
      }
    });
  }

  function saveNote() {
    startTransition(async () => {
      await updateContactMessageNote(message.id, note);
      setNoteDirty(false);
    });
  }

  function doDelete() {
    startTransition(async () => {
      await deleteContactMessage(message.id);
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
            {message.name}
            <span className={`admin-pill admin-pill-${status}`}>
              {STATUS_LABEL[status]}
            </span>
          </div>
          <div className="admin-booking-summary">
            <span>{message.email}</span>
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
              <div className="admin-booking-field">
                <span className="admin-booking-field-label">
                  <Mail size={14} aria-hidden="true" /> E-mail
                </span>
                <div className="admin-booking-field-value">
                  <a href={`mailto:${message.email}`}>{message.email}</a>
                </div>
              </div>
              <div className="admin-booking-field">
                <span className="admin-booking-field-label">Üzenet</span>
                <div className="admin-booking-field-value">
                  <p className="admin-booking-message">{message.message}</p>
                </div>
              </div>
            </div>

            <div className="admin-booking-controls">
              <div className="admin-field">
                <label>Státusz</label>
                <select
                  value={status}
                  onChange={(e) => changeStatus(e.target.value as Status)}
                  disabled={isPending}
                >
                  {(['new', 'replied', 'archived'] as Status[]).map((s) => (
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
                  placeholder="Pl. visszaírtam emailben"
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
                    Üzenet törlése
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
