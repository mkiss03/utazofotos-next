'use client';

import { useState, useTransition, useActionState } from 'react';
import Image from 'next/image';
import { Save, Loader2 } from 'lucide-react';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { saveSchedule, type SaveState } from './actions';
import type { ScheduleContent } from '@/lib/site-content';

const initial: SaveState = { ok: false };

export function ScheduleEditor({ initial: data }: { initial: ScheduleContent }) {
  const [state, action] = useActionState(saveSchedule, initial);
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(data.title);
  const [subtitle, setSubtitle] = useState(data.subtitle);
  const [imageUrl, setImageUrl] = useState(data.imageUrl);
  const [imageAlt, setImageAlt] = useState(data.imageAlt);

  function submit(fd: FormData) {
    startTransition(() => action(fd));
  }

  return (
    <form className="admin-form-grid" action={submit}>
      <div className="admin-field">
        <label htmlFor="sched-title">Cím</label>
        <input
          id="sched-title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="admin-field">
        <label htmlFor="sched-sub">Alcím</label>
        <input
          id="sched-sub"
          name="subtitle"
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
        />
      </div>

      <div className="admin-field admin-field-wide">
        <label>Menetrend kép (pl. PDF helyett kép)</label>
        <input type="hidden" name="imageUrl" value={imageUrl} />
        <input type="hidden" name="imageAlt" value={imageAlt} />
        {imageUrl && (
          <div className="admin-cover-preview">
            <Image src={imageUrl} alt={imageAlt || 'Menetrend'} fill sizes="600px" unoptimized />
          </div>
        )}
        <MediaPicker
          onPick={({ url, alt }) => {
            setImageUrl(url);
            if (alt) setImageAlt(alt);
          }}
          buttonLabel={imageUrl ? 'Másik kép választása' : 'Kép választása'}
        />
      </div>
      <div className="admin-field admin-field-wide">
        <label htmlFor="sched-alt">Kép alt szövege</label>
        <input
          id="sched-alt"
          type="text"
          value={imageAlt}
          onChange={(e) => setImageAlt(e.target.value)}
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
