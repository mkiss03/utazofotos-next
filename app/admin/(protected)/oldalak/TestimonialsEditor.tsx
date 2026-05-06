'use client';

import { useState, useTransition, useActionState } from 'react';
import Image from 'next/image';
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Star,
} from 'lucide-react';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { saveTestimonials, type SaveState } from './actions';
import type { TestimonialEntry, TestimonialsContent } from '@/lib/site-content';

const initial: SaveState = { ok: false };

function newId() {
  return `t_${Math.random().toString(36).slice(2, 9)}`;
}

function emptyItem(): TestimonialEntry {
  return {
    id: newId(),
    name: '',
    trip: '',
    quote: '',
    photoUrl: '/images/hero.jpg',
    photoAlt: '',
    rating: 5,
  };
}

export function TestimonialsEditor({
  initial: data,
}: {
  initial: TestimonialsContent;
}) {
  const [state, action] = useActionState(saveTestimonials, initial);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(data.title);
  const [subtitle, setSubtitle] = useState(data.subtitle);
  const [items, setItems] = useState<TestimonialEntry[]>(
    data.items?.length ? data.items : [emptyItem()],
  );

  function submit(fd: FormData) {
    fd.set('items', JSON.stringify(items));
    startTransition(() => action(fd));
  }

  function update(idx: number, patch: Partial<TestimonialEntry>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }
  function remove(idx: number) {
    if (!confirm('Biztosan törlöd ezt a véleményt?')) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }
  function add() {
    setItems((prev) => [...prev, emptyItem()]);
  }
  function move(idx: number, dir: -1 | 1) {
    const next = idx + dir;
    if (next < 0 || next >= items.length) return;
    setItems((prev) => {
      const copy = [...prev];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      return copy;
    });
  }

  return (
    <form className="admin-form-grid" action={submit}>
      <div className="admin-field admin-field-wide">
        <label htmlFor="t-title">Szakasz címe</label>
        <input
          id="t-title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="admin-field admin-field-wide">
        <label htmlFor="t-subtitle">Alcím / leírás</label>
        <input
          id="t-subtitle"
          name="subtitle"
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
        />
      </div>

      <div className="admin-field admin-field-wide">
        <label>Vélemények ({items.length})</label>
        <div className="admin-test-list">
          {items.map((it, idx) => (
            <div key={it.id} className="admin-test-row">
              <div className="admin-test-row-head">
                <strong>
                  {idx + 1}. {it.name || '— névtelen —'}
                </strong>
                <div className="admin-paragraph-actions">
                  <button
                    type="button"
                    className="admin-icon-btn"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    aria-label="Feljebb"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-btn"
                    onClick={() => move(idx, 1)}
                    disabled={idx === items.length - 1}
                    aria-label="Lejjebb"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-btn admin-icon-btn-danger"
                    onClick={() => remove(idx)}
                    aria-label="Törlés"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="admin-test-grid">
                <div className="admin-test-photo">
                  {it.photoUrl && (
                    <div className="admin-cover-preview admin-cover-preview-sm">
                      <Image
                        src={it.photoUrl}
                        alt={it.photoAlt || 'Vélemény fotó'}
                        fill
                        sizes="320px"
                        unoptimized
                      />
                    </div>
                  )}
                  <MediaPicker
                    onPick={({ url, alt }) =>
                      update(idx, {
                        photoUrl: url,
                        photoAlt: alt || it.photoAlt,
                      })
                    }
                    buttonLabel={
                      it.photoUrl ? 'Másik kép választása' : 'Kép választása'
                    }
                  />
                </div>

                <div className="admin-test-fields">
                  <div className="admin-field">
                    <label>Vendég neve</label>
                    <input
                      type="text"
                      value={it.name}
                      onChange={(e) => update(idx, { name: e.target.value })}
                      placeholder="pl. Anna"
                      required
                    />
                  </div>
                  <div className="admin-field">
                    <label>Utazás megnevezése</label>
                    <input
                      type="text"
                      value={it.trip}
                      onChange={(e) => update(idx, { trip: e.target.value })}
                      placeholder="pl. Toszkána – 2025 ősz"
                    />
                  </div>
                  <div className="admin-field admin-field-wide">
                    <label>Idézet / vélemény</label>
                    <textarea
                      rows={4}
                      value={it.quote}
                      onChange={(e) => update(idx, { quote: e.target.value })}
                      placeholder="A vendég saját szavai…"
                      required
                    />
                  </div>
                  <div className="admin-field">
                    <label>Kép alt szövege</label>
                    <input
                      type="text"
                      value={it.photoAlt}
                      onChange={(e) =>
                        update(idx, { photoAlt: e.target.value })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>Csillagok (0–5)</label>
                    <div className="admin-test-stars">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={`admin-test-star ${
                            (it.rating ?? 0) >= n ? 'is-on' : ''
                          }`}
                          onClick={() =>
                            update(idx, {
                              rating: it.rating === n ? n - 1 : n,
                            })
                          }
                          aria-label={`${n} csillag`}
                        >
                          <Star
                            size={20}
                            fill={
                              (it.rating ?? 0) >= n ? 'currentColor' : 'none'
                            }
                            strokeWidth={1.5}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={add}
          >
            <Plus size={14} /> Új vélemény hozzáadása
          </button>
        </div>
      </div>

      <div className="admin-form-bar admin-field-wide">
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 size={16} className="admin-spin" />
          ) : (
            <Save size={16} />
          )}
          Mentés
        </button>
        {state.ok && (
          <span className="admin-form-status admin-form-status-ok">
            ✓ Mentve
          </span>
        )}
        {state.error && (
          <span className="admin-form-status admin-form-status-err">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}
