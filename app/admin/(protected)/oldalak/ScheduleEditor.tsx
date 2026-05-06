'use client';

import { useState, useTransition, useActionState } from 'react';
import { Save, Loader2, Info } from 'lucide-react';
import { saveSchedule, type SaveState } from './actions';
import type { ScheduleContent } from '@/lib/site-content';

const initial: SaveState = { ok: false };

export function ScheduleEditor({ initial: data }: { initial: ScheduleContent }) {
  const [state, action] = useActionState(saveSchedule, initial);
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(data.title);
  const [subtitle, setSubtitle] = useState(data.subtitle);

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
        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            padding: '12px 14px',
            background: 'var(--accent-soft)',
            borderRadius: 8,
            fontSize: '.9rem',
            lineHeight: 1.5,
          }}
        >
          <Info size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--accent)' }} />
          <div>
            A naptár automatikusan az úticélok indulásaiból épül fel. Új
            időpont, státusz, megjegyzés vagy időtartam felvétele:{' '}
            <strong>Úticélok → [úticél] → Indulási időpontok</strong>.
          </div>
        </div>
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
