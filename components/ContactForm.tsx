'use client';

import { useActionState, useTransition } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { submitContactMessage, type ContactState } from '@/app/(site)/kapcsolat/actions';

const initialState: ContactState = { ok: false };

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactMessage, initialState);
  const [isPending, startTransition] = useTransition();

  if (state.ok) {
    return <div className="form-ok">Köszönjük az üzenetedet! Hamarosan visszaírunk.</div>;
  }

  const fe = state.fieldErrors ?? {};

  function handleSubmit(formData: FormData) {
    startTransition(() => formAction(formData));
  }

  return (
    <form className="form" action={handleSubmit} noValidate>
      {/* Honeypot — emberek számára nem látszik */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
        aria-hidden="true"
      />

      <div className="form-g">
        <label htmlFor="cf-name" className="form-lbl">
          Név *
        </label>
        <input
          id="cf-name"
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
        <label htmlFor="cf-email" className="form-lbl">
          E-mail *
        </label>
        <input
          id="cf-email"
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
      <div className="form-g">
        <label htmlFor="cf-msg" className="form-lbl">
          Üzenet *
        </label>
        <textarea
          id="cf-msg"
          name="message"
          className="form-ctrl"
          style={{ minHeight: 140 }}
          required
          placeholder="Kérdésed..."
          aria-invalid={Boolean(fe.message)}
        />
        {fe.message && <p className="form-error">{fe.message}</p>}
      </div>

      {state.error && !Object.keys(fe).length && (
        <p className="form-error">{state.error}</p>
      )}

      <button type="submit" className="form-submit" disabled={isPending}>
        {isPending ? (
          <Loader2 size={14} className="spin" aria-hidden="true" />
        ) : (
          <Send size={14} aria-hidden="true" />
        )}
        {isPending ? 'Küldés…' : 'Üzenet küldése'}
      </button>
    </form>
  );
}
