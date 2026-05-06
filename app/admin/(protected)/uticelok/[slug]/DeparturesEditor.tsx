'use client';

import { useState, useTransition } from 'react';
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Save,
  X,
  CalendarDays,
  CircleDot,
  Plane,
  Bus,
  Users,
} from 'lucide-react';
import {
  createDeparture,
  updateDeparture,
  deleteDeparture,
  type DepartureFormState,
} from './departure-actions';

type Departure = {
  id: string;
  destinationId: string;
  dateISO: string;
  dateLabel: string;
  monthShort: string;
  day: string;
  durationDays: number | null;
  priceFrom: string | null;
  status: 'available' | 'few' | 'full';
  transportMode: 'plane' | 'bus' | 'mixed';
  maxPeople: number | null;
  note: string | null;
};

const STATUS_LABEL: Record<Departure['status'], string> = {
  available: 'Szabad helyek',
  few: 'Utolsó helyek',
  full: 'Megtelt',
};

const TRANSPORT_LABEL: Record<Departure['transportMode'], string> = {
  plane: 'Repülő',
  bus: 'Autóbusz',
  mixed: 'Vegyes',
};

export function DeparturesEditor({
  destinationId,
  destinationSlug,
  initial,
}: {
  destinationId: string;
  destinationSlug: string;
  initial: Departure[];
}) {
  const [items, setItems] = useState<Departure[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  // Megjegyzés: a server actions revalidatePath-ot hív, így a teljes oldal újratöltéskor
  // friss adatot kapunk. Itt kliens-state-ben is lokálisan frissítünk a gyors UI-ért.

  function handleCreated(updated: Departure[]) {
    setItems(updated);
    setCreating(false);
  }
  function handleUpdated(updated: Departure[]) {
    setItems(updated);
    setEditingId(null);
  }

  return (
    <div className="admin-departures">
      <div className="admin-departures-header">
        <p className="admin-section-hint" style={{ flex: 1, marginBottom: 0 }}>
          {items.length === 0
            ? 'Még nincs egy indulás sem ehhez az úticélhoz.'
            : `${items.length} indulás. A jövőbeli dátumok a publikus oldalakon is megjelennek.`}
        </p>
        {!creating && (
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => {
              setCreating(true);
              setEditingId(null);
            }}
          >
            <Plus size={16} aria-hidden="true" /> Új indulás
          </button>
        )}
      </div>

      {creating && (
        <DepartureForm
          mode="create"
          destinationId={destinationId}
          destinationSlug={destinationSlug}
          onCancel={() => setCreating(false)}
          onSaved={(d) => handleCreated([...items, d].sort(byDate))}
        />
      )}

      {items.length > 0 && (
        <ul className="admin-departure-list">
          {items.map((dep) => {
            const isPast = dep.dateISO < today;
            const isEditing = editingId === dep.id;
            return (
              <li
                key={dep.id}
                className={`admin-departure-item ${isPast ? 'is-past' : ''}`}
              >
                {isEditing ? (
                  <DepartureForm
                    mode="edit"
                    initial={dep}
                    destinationId={destinationId}
                    destinationSlug={destinationSlug}
                    onCancel={() => setEditingId(null)}
                    onSaved={(d) =>
                      handleUpdated(
                        items.map((it) => (it.id === d.id ? d : it)).sort(byDate),
                      )
                    }
                    onDeleted={() =>
                      handleUpdated(items.filter((it) => it.id !== dep.id))
                    }
                  />
                ) : (
                  <DepartureRow
                    departure={dep}
                    isPast={isPast}
                    onEdit={() => {
                      setEditingId(dep.id);
                      setCreating(false);
                    }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function byDate(a: Departure, b: Departure) {
  return a.dateISO.localeCompare(b.dateISO);
}

function DepartureRow({
  departure,
  isPast,
  onEdit,
}: {
  departure: Departure;
  isPast: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="admin-departure-row">
      <div className="admin-departure-badge">
        <span className="admin-departure-month">{departure.monthShort}</span>
        <span className="admin-departure-day">{departure.day}</span>
      </div>
      <div className="admin-departure-info">
        <div className="admin-departure-label">
          <CalendarDays size={14} aria-hidden="true" />
          {departure.dateLabel}
          {isPast && <span className="admin-pill admin-pill-warn">Múlt</span>}
        </div>
        <div className="admin-departure-meta">
          <StatusPill status={departure.status} />
          <TransportPill mode={departure.transportMode} />
          {departure.priceFrom && <span>{departure.priceFrom}</span>}
          {departure.durationDays && (
            <span>{departure.durationDays} napos</span>
          )}
          {departure.maxPeople && (
            <span>
              <Users size={12} aria-hidden="true" style={{ marginRight: 4, verticalAlign: -1 }} />
              max. {departure.maxPeople} fő
            </span>
          )}
          {departure.note && <span>📝 {departure.note}</span>}
        </div>
      </div>
      <button
        type="button"
        className="admin-btn admin-btn-secondary"
        onClick={onEdit}
      >
        <Pencil size={14} aria-hidden="true" />
        <span>Szerkeszt</span>
      </button>
    </div>
  );
}

function StatusPill({ status }: { status: Departure['status'] }) {
  const cls =
    status === 'available'
      ? 'admin-pill-ok'
      : status === 'few'
      ? 'admin-pill-warn'
      : 'admin-pill-danger';
  return (
    <span className={`admin-pill ${cls}`}>
      <CircleDot size={10} aria-hidden="true" style={{ marginRight: 4, verticalAlign: -1 }} />
      {STATUS_LABEL[status]}
    </span>
  );
}

function TransportPill({ mode }: { mode: Departure['transportMode'] }) {
  const Icon = mode === 'bus' ? Bus : mode === 'mixed' ? Bus : Plane;
  return (
    <span className="admin-pill admin-pill-info">
      <Icon size={10} aria-hidden="true" style={{ marginRight: 4, verticalAlign: -1 }} />
      {TRANSPORT_LABEL[mode]}
    </span>
  );
}

function DepartureForm({
  mode,
  initial,
  destinationId,
  destinationSlug,
  onCancel,
  onSaved,
  onDeleted,
}: {
  mode: 'create' | 'edit';
  initial?: Departure;
  destinationId: string;
  destinationSlug: string;
  onCancel: () => void;
  onSaved: (d: Departure) => void;
  onDeleted?: () => void;
}) {
  const [dateISO, setDateISO] = useState(initial?.dateISO ?? '');
  const [durationDays, setDurationDays] = useState(
    initial?.durationDays?.toString() ?? '',
  );
  const [priceFrom, setPriceFrom] = useState(initial?.priceFrom ?? '');
  const [status, setStatus] = useState<Departure['status']>(
    initial?.status ?? 'available',
  );
  const [transportMode, setTransportMode] = useState<Departure['transportMode']>(
    initial?.transportMode ?? 'plane',
  );
  const [maxPeople, setMaxPeople] = useState(
    initial?.maxPeople?.toString() ?? '',
  );
  const [note, setNote] = useState(initial?.note ?? '');

  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<DepartureFormState>({ ok: false });
  const [confirmDelete, setConfirmDelete] = useState(false);

  function buildFormData(): FormData {
    const fd = new FormData();
    fd.set('destinationId', destinationId);
    fd.set('dateISO', dateISO);
    fd.set('durationDays', durationDays);
    fd.set('priceFrom', priceFrom);
    fd.set('status', status);
    fd.set('transportMode', transportMode);
    fd.set('maxPeople', maxPeople);
    fd.set('note', note);
    return fd;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const fd = buildFormData();
      let res: DepartureFormState;
      if (mode === 'create') {
        res = await createDeparture(destinationSlug, fd);
      } else {
        res = await updateDeparture(initial!.id, destinationSlug, fd);
      }
      setState(res);
      if (res.ok) {
        // Optimista lokális frissítés (ha csak revalidatePath-ot várunk, kicsit lassabb)
        const a = dateISO.split('-').map((s) => parseInt(s, 10));
        const dummy: Departure = {
          id: initial?.id ?? cryptoRandomId(),
          destinationId,
          dateISO,
          dateLabel: buildHuLabel(dateISO, durationDays),
          monthShort: HU_MONTH_SHORT[a[1] - 1] ?? '',
          day: String(a[2] ?? ''),
          durationDays: durationDays ? parseInt(durationDays, 10) : null,
          priceFrom: priceFrom || null,
          status,
          transportMode,
          maxPeople: maxPeople ? parseInt(maxPeople, 10) : null,
          note: note || null,
        };
        onSaved(dummy);
      }
    });
  }

  function handleDelete() {
    if (!initial) return;
    startTransition(async () => {
      await deleteDeparture(initial.id, destinationSlug);
      onDeleted?.();
    });
  }

  const fe = state.fieldErrors ?? {};

  return (
    <form onSubmit={handleSubmit} className="admin-departure-form">
      <div className="admin-departure-form-grid">
        <div className="admin-field">
          <label>Indulás dátuma</label>
          <input
            type="date"
            value={dateISO}
            onChange={(e) => setDateISO(e.target.value)}
            required
            aria-invalid={Boolean(fe.dateISO)}
          />
          {fe.dateISO && <p className="admin-field-error">{fe.dateISO}</p>}
        </div>
        <div className="admin-field">
          <label>Időtartam (napok, opcionális)</label>
          <input
            type="number"
            min={1}
            max={365}
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            placeholder="Pl. 7"
          />
          <p className="admin-field-hint">
            Üresen hagyva 1 napos. Több napos esetén tartomány-címke készül.
          </p>
        </div>
        <div className="admin-field">
          <label>Ár (formázott szöveg)</label>
          <input
            type="text"
            value={priceFrom}
            onChange={(e) => setPriceFrom(e.target.value)}
            placeholder="Pl. 189 000 Ft"
            maxLength={60}
          />
        </div>
        <div className="admin-field">
          <label>Foglalási állapot</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Departure['status'])}
          >
            <option value="available">Szabad helyek</option>
            <option value="few">Utolsó helyek</option>
            <option value="full">Megtelt</option>
          </select>
        </div>
        <div className="admin-field">
          <label>Közlekedési mód</label>
          <select
            value={transportMode}
            onChange={(e) =>
              setTransportMode(e.target.value as Departure['transportMode'])
            }
          >
            <option value="plane">Repülő</option>
            <option value="bus">Autóbusz</option>
            <option value="mixed">Vegyes</option>
          </select>
          <p className="admin-field-hint">
            A naptárban ennek megfelelő ikon jelenik meg.
          </p>
        </div>
        <div className="admin-field">
          <label>Max. létszám (opcionális)</label>
          <input
            type="number"
            min={1}
            max={999}
            value={maxPeople}
            onChange={(e) => setMaxPeople(e.target.value)}
            placeholder="Pl. 14"
          />
        </div>
        <div className="admin-field admin-field-wide">
          <label>Megjegyzés (opcionális)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Pl. Kézipoggyásszal, busszal indulunk"
            maxLength={200}
          />
        </div>
      </div>

      {state.error && (
        <div className="admin-form-status admin-form-status-error">
          {state.error}
        </div>
      )}

      <div className="admin-departure-form-actions">
        {mode === 'edit' && (
          <>
            {confirmDelete ? (
              <>
                <span style={{ color: 'var(--danger)', fontWeight: 500 }}>
                  Biztosan törlöd?
                </span>
                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  onClick={handleDelete}
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
                  onClick={() => setConfirmDelete(false)}
                  disabled={isPending}
                >
                  Mégse
                </button>
              </>
            ) : (
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={() => setConfirmDelete(true)}
                disabled={isPending}
              >
                <Trash2 size={14} aria-hidden="true" />
                Törlés
              </button>
            )}
          </>
        )}
        <span style={{ flex: 1 }} />
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={onCancel}
          disabled={isPending}
        >
          <X size={14} aria-hidden="true" />
          Mégse
        </button>
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 size={14} className="admin-spin" aria-hidden="true" />
          ) : (
            <Save size={14} aria-hidden="true" />
          )}
          {mode === 'create' ? 'Létrehozás' : 'Mentés'}
        </button>
      </div>
    </form>
  );
}

const HU_MONTH_SHORT = [
  'JAN',
  'FEB',
  'MÁR',
  'ÁPR',
  'MÁJ',
  'JÚN',
  'JÚL',
  'AUG',
  'SZEPT',
  'OKT',
  'NOV',
  'DEC',
];
const HU_MONTH_LONG = [
  'január',
  'február',
  'március',
  'április',
  'május',
  'június',
  'július',
  'augusztus',
  'szeptember',
  'október',
  'november',
  'december',
];
function buildHuLabel(iso: string, durationStr: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map((s) => parseInt(s, 10));
  const dur = durationStr ? parseInt(durationStr, 10) : 0;
  if (!dur || dur <= 1) return `${y}. ${HU_MONTH_LONG[m - 1]} ${d}.`;
  const start = new Date(Date.UTC(y, m - 1, d));
  const end = new Date(start.getTime() + (dur - 1) * 86400000);
  const eM = end.getUTCMonth();
  const eD = end.getUTCDate();
  return `${y}. ${HU_MONTH_LONG[m - 1].slice(0, 4)}. ${d}. – ${HU_MONTH_LONG[eM].slice(0, 4)}. ${eD}.`;
}
function cryptoRandomId() {
  return Math.random().toString(36).slice(2, 12);
}
