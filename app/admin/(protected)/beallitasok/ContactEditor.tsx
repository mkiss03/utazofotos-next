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
  const [instagramUrl, setInstagramUrl] = useState(data.instagramUrl ?? '');
  const [instagramLabel, setInstagramLabel] = useState(data.instagramLabel ?? '@utazofotos');

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
          placeholder="https://www.facebook.com/groups/..."
        />
      </div>
      <div className="admin-field admin-field-wide">
        <label htmlFor="ct-fb-label">Facebook megnevezése (megjelenő szöveg)</label>
        <input
          id="ct-fb-label"
          name="facebookLabel"
          type="text"
          value={facebookLabel}
          onChange={(e) => setFacebookLabel(e.target.value)}
        />
      </div>
      <div className="admin-field admin-field-wide">
        <label htmlFor="ct-ig-url">
          Instagram URL{' '}
          <span className="admin-field-hint" style={{ display: 'inline', marginLeft: 6 }}>
            (hagyd üresen, ha még nincs Instagram fiók — nem jelenik meg az oldalon)
          </span>
        </label>
        <input
          id="ct-ig-url"
          name="instagramUrl"
          type="url"
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          placeholder="https://www.instagram.com/utazofotos"
        />
      </div>
      <div className="admin-field admin-field-wide">
        <label htmlFor="ct-ig-label">Instagram megnevezése (megjelenő szöveg)</label>
        <input
          id="ct-ig-label"
          name="instagramLabel"
          type="text"
          value={instagramLabel}
          onChange={(e) => setInstagramLabel(e.target.value)}
          placeholder="@utazofotos"
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
