'use client';

import { useState, FormEvent } from 'react';
import { Send } from 'lucide-react';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    // TODO: backend integráció
    await new Promise((r) => setTimeout(r, 400));
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return <div className="form-ok">Köszönjük az üzenetedet! Hamarosan visszaírunk.</div>;
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="form-g">
        <label htmlFor="cf-name" className="form-lbl">
          Név *
        </label>
        <input id="cf-name" name="name" className="form-ctrl" type="text" required placeholder="Teljes neved" />
      </div>
      <div className="form-g">
        <label htmlFor="cf-email" className="form-lbl">
          E-mail *
        </label>
        <input id="cf-email" name="email" className="form-ctrl" type="email" required placeholder="email@example.com" />
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
        />
      </div>
      <button type="submit" className="form-submit" disabled={submitting}>
        <Send size={14} aria-hidden="true" />
        {submitting ? 'Küldés…' : 'Üzenet küldése'}
      </button>
    </form>
  );
}
