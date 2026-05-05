'use client';

import { useState, useTransition, useActionState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { saveContact, type SaveState } from '../oldalak/actions';
import type { ContactContent } from '@/lib/site-content';

const initial: SaveState = { ok: false };

export function ContactEditor({ initial: data }: { initial: ContactContent }) {
  const [state, action] = useActionState(saveContact, initial);
  const [isPending, startTransition] = useTransition();
  const [phone, setPhone] = useState(data.phone);
  const [email, setEmail] = useState(data.email);
  const [facebookUrl, setFacebookUrl] = useState(data.facebookUrl);
  const [facebookLabel, setFacebookLabel] = useState(data.facebookLabel);

  function submit(fd: FormData) {
    startTransition(() => action(fd));
  }

  return (
    <form className="admin-form-grid" action={submit}>
      <div className="admin-field">
        <label htmlFor="ct-phone">Telefonszám</label>
        <input
          id="ct-phone"
          name="phone"
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <div className="admin-field">
        <label htmlFor="ct-email">E-mail cím</label>
        <input
          id="ct-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="admin-field admin-field-wide">
        <label htmlFor="ct-fb-url">Facebook csoport URL</label>
        <input
          id="ct-fb-url"
          name="facebookUrl"
          type="url"
          value={facebookUrl}
          onChange={(e) => setFacebookUrl(e.target.value)}
          required
        />
      </div>
      <div className="admin-field admin-field-wide">
        <label htmlFor="ct-fb-label">Facebook csoport megnevezése</label>
        <input
          id="ct-fb-label"
          name="facebookLabel"
          type="text"
          value={facebookLabel}
          onChange={(e) => setFacebookLabel(e.target.value)}
        />
      </div>

      <div className="admin-form-bar admin-field-wide">
        <button type="submit" className="admin-btn admin-btn-primary" disabled={isPending}>
          {isPending ? <Loader2 size={16} className="admin-spin" /> : <Save size={16} />}
          Mentés
        </button>
        {state.ok && <span className="admin-form-status admin-form-status-ok">✓ Mentve</span>}
        {state.error && <span className="admin-form-status admin-form-status-err">{state.error}</span>}
      </div>
    </form>
  );
}
