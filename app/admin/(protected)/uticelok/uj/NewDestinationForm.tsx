'use client';

import { useState, useTransition, useActionState } from 'react';
import { Plus, Loader2, Wand2 } from 'lucide-react';
import { createDestination, type CreateState } from './actions';
import { slugify } from '@/lib/slug';

const initialState: CreateState = { ok: false };

export function NewDestinationForm() {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(createDestination, initialState);

  const [title, setTitle] = useState('');
  const [region, setRegion] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  const fe = state.fieldErrors ?? {};

  function onTitle(v: string) {
    setTitle(v);
    if (!slugTouched) {
      setSlug(slugify(v));
    }
  }

  function handleSubmit(formData: FormData) {
    startTransition(() => formAction(formData));
  }

  return (
    <form action={handleSubmit} className="admin-form">
      <div className="admin-field">
        <label htmlFor="n-title">Cím</label>
        <input
          id="n-title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => onTitle(e.target.value)}
          maxLength={200}
          required
          autoFocus
          aria-invalid={Boolean(fe.title)}
        />
        {fe.title && <p className="admin-field-error">{fe.title}</p>}
      </div>

      <div className="admin-field">
        <label htmlFor="n-region">Régió</label>
        <input
          id="n-region"
          name="region"
          type="text"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          maxLength={80}
          required
          aria-invalid={Boolean(fe.region)}
        />
        {fe.region && <p className="admin-field-error">{fe.region}</p>}
      </div>

      <div className="admin-field">
        <label htmlFor="n-slug">Webcím (slug)</label>
        <div className="admin-field-row">
          <span className="admin-field-prefix">/uticelok/</span>
          <input
            id="n-slug"
            name="slug"
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            maxLength={120}
            required
            aria-invalid={Boolean(fe.slug)}
          />
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => {
              setSlug(slugify(title));
              setSlugTouched(false);
            }}
            title="Generálás a címből"
          >
            <Wand2 size={16} aria-hidden="true" />
            <span>Cím alapján</span>
          </button>
        </div>
        {fe.slug && <p className="admin-field-error">{fe.slug}</p>}
        <p className="admin-field-hint">
          Automatikusan generáljuk a címből — felülírhatod, ha szeretnéd.
        </p>
      </div>

      <div className="admin-form-bar">
        {state.error && (
          <div className="admin-form-status admin-form-status-error">
            {state.error}
          </div>
        )}
        <button
          type="submit"
          className="admin-btn admin-btn-primary admin-btn-lg"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 size={18} className="admin-spin" aria-hidden="true" />
              Létrehozás…
            </>
          ) : (
            <>
              <Plus size={18} aria-hidden="true" />
              Létrehozás és szerkesztés
            </>
          )}
        </button>
      </div>
    </form>
  );
}
