'use client';

import { useState, useMemo, useEffect, useTransition, useActionState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import {
  type Destination,
  sortByNextDeparture,
  findDepartureInList,
} from '@/lib/destinations';
import { submitBooking, type BookingState } from '@/app/(site)/jelentkezes/actions';

type Option = { value: string; label: string };

const initialState: BookingState = { ok: false };

export function BookingForm({
  preselectedDepartureId,
  preselectedSlug,
  allDestinations,
}: {
  preselectedDepartureId?: string;
  preselectedSlug?: string;
  allDestinations: Destination[];
}) {
  const [state, formAction] = useActionState(submitBooking, initialState);
  const [isPending, startTransition] = useTransition();

  // Lapos opciólista: csak még jövőbeli, nem teljesen telt indulások.
  const options: Option[] = useMemo(() => {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const opts: Option[] = [];
    for (const d of sortByNextDeparture(allDestinations)) {
      for (const dep of d.departures) {
        if (new Date(dep.dateISO) < today) continue;
        const fullSuffix =
          dep.status === 'full'
            ? ' (BETELT)'
            : dep.status === 'few'
              ? ' (kevés hely)'
              : '';
        opts.push({
          value: dep.id,
          label: `${d.title} – ${dep.dateLabel}${fullSuffix}`,
        });
      }
    }
    return opts;
  }, [allDestinations]);

  const resolvedInitial = useMemo(() => {
    if (preselectedDepartureId) {
      const found = findDepartureInList(allDestinations, preselectedDepartureId);
      if (found) return found.departure.id;
    }
    if (preselectedSlug) {
      const dest = allDestinations.find((d) => d.slug === preselectedSlug);
      const next = dest?.departures.find((dep) => dep.status !== 'full');
      if (next) return next.id;
    }
    return '';
  }, [preselectedDepartureId, preselectedSlug, allDestinations]);

  const [tripValue, setTripValue] = useState(resolvedInitial);
  useEffect(() => {
    if (resolvedInitial) setTripValue(resolvedInitial);
  }, [resolvedInitial]);

  function handleSubmit(formData: FormData) {
    startTransition(() => formAction(formData));
  }

  if (state.ok) {
    return (
      <div className="form-ok">
        Köszönjük a jelentkezésedet! Hamarosan, e-mailben visszaigazoljuk a
        foglalásodat.
      </div>
    );
  }

  const fe = state.fieldErrors ?? {};
  const preselectedLabel =
    tripValue && options.find((o) => o.value === tripValue)?.label;

  return (
    <form className="form" action={handleSubmit}>
      {/* Honeypot mező — emberek számára nem látszik. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: 1,
          height: 1,
          opacity: 0,
        }}
        aria-hidden="true"
      />

      <div className="form-row">
        <div className="form-g">
          <label htmlFor="bf-name" className="form-lbl">
            Név *
          </label>
          <input
            id="bf-name"
            name="name"
            className="form-ctrl"
            type="text"
            required
            placeholder="Teljes neved"
            autoComplete="name"
            aria-invalid={Boolean(fe.name)}
          />
          {fe.name && <p className="form-error">{fe.name}</p>}
        </div>
        <div className="form-g">
          <label htmlFor="bf-email" className="form-lbl">
            E-mail *
          </label>
          <input
            id="bf-email"
            name="email"
            className="form-ctrl"
            type="email"
            required
            placeholder="email@example.com"
            autoComplete="email"
            aria-invalid={Boolean(fe.email)}
          />
          {fe.email && <p className="form-error">{fe.email}</p>}
        </div>
      </div>
      <div className="form-g">
        <label htmlFor="bf-phone" className="form-lbl">
          Telefonszám *
        </label>
        <input
          id="bf-phone"
          name="phone"
          className="form-ctrl"
          type="tel"
          required
          placeholder="+36 30 000 0000"
          autoComplete="tel"
          aria-invalid={Boolean(fe.phone)}
        />
        {fe.phone && <p className="form-error">{fe.phone}</p>}
      </div>
      <div className="form-g">
        <label htmlFor="bf-trip" className="form-lbl">
          Melyik útra és időpontra jelentkezel? *
        </label>
        <select
          id="bf-trip"
          name="trip"
          className="form-ctrl"
          value={tripValue}
          onChange={(e) => setTripValue(e.target.value)}
          required
          aria-invalid={Boolean(fe.departureId)}
        >
          <option value="">— Kérjük válassz időpontot —</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {fe.departureId && <p className="form-error">{fe.departureId}</p>}
        {preselectedLabel && !fe.departureId && (
          <p
            className="form-note"
            style={{
              marginTop: 8,
              color: 'var(--success)',
              fontWeight: 600,
            }}
            role="status"
          >
            ✓ Kiválasztva: {preselectedLabel}
          </p>
        )}
      </div>
      <div className="form-g">
        <label htmlFor="bf-msg" className="form-lbl">
          Megjegyzés
        </label>
        <textarea
          id="bf-msg"
          name="message"
          className="form-ctrl"
          placeholder="Kérdéseid, különleges kéréseid..."
        />
      </div>
      <p className="form-note">
        Foglalj időpontot időben! Helyedet előleg befizetésével tudod véglegesíteni.
        A foglalásod e-mailben visszaigazoljuk.
      </p>

      {state.error && (
        <div className="form-error-box" role="alert">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        className="form-submit btn-large"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 size={16} className="admin-spin" aria-hidden="true" />
        ) : (
          <Send size={16} aria-hidden="true" />
        )}
        {isPending ? 'Küldés…' : 'Foglalok most'}
      </button>
    </form>
  );
}
