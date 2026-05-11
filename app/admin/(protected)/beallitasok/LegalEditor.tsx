'use client';

import { useState, useTransition, useActionState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { saveLegalPage, type SaveState } from '../oldalak/actions';
import type { LegalPageContent, SiteContentMap } from '@/lib/site-content';
import { RichTextEditor } from '@/components/RichTextEditor';

const initial: SaveState = { ok: false };

const PAGE_LABELS: Record<string, string> = {
  legalImprint: 'Impresszum',
  legalPrivacy: 'Adatvédelmi tájékoztató',
  legalTerms: 'ÁSZF',
  legalCookies: 'Sütitájékoztató',
};

const PAGE_SLUGS: Record<string, string> = {
  legalImprint: '/impresszum',
  legalPrivacy: '/adatvedelem',
  legalTerms: '/aszf',
  legalCookies: '/sutik',
};

export function LegalEditor({
  contentKey,
  initial: data,
}: {
  contentKey: keyof Pick<SiteContentMap, 'legalImprint' | 'legalPrivacy' | 'legalTerms' | 'legalCookies'>;
  initial: LegalPageContent;
}) {
  const [state, action] = useActionState(saveLegalPage, initial);
  const [isPending, startTransition] = useTransition();
  const [lastUpdated, setLastUpdated] = useState(data.lastUpdated);
  const [html, setHtml] = useState(data.html);

  function submit(fd: FormData) {
    startTransition(() => action(fd));
  }

  const slug = PAGE_SLUGS[contentKey];

  return (
    <form className="admin-form-grid" action={submit}>
      <input type="hidden" name="key" value={contentKey} />

      <div className="admin-field">
        <label htmlFor={`${contentKey}-date`}>Utolsó frissítés dátuma</label>
        <input
          id={`${contentKey}-date`}
          name="lastUpdated"
          type="date"
          value={lastUpdated}
          onChange={(e) => setLastUpdated(e.target.value)}
          required
        />
      </div>
      <div className="admin-field admin-field-hint" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>Publikus oldal:</span>
        <a href={slug} target="_blank" rel="noopener" className="admin-link">{slug}</a>
      </div>

      <div className="admin-field admin-field-wide">
        <label>Tartalom</label>
        <RichTextEditor value={html} onChange={setHtml} />
        <input type="hidden" name="html" value={html} />
      </div>

      <div className="admin-form-bar admin-field-wide">
        <button type="submit" className="admin-btn admin-btn-primary" disabled={isPending}>
          {isPending ? <Loader2 size={16} className="admin-spin" /> : <Save size={16} />}
          {PAGE_LABELS[contentKey]} mentése
        </button>
        {state.ok && <span className="admin-form-status admin-form-status-ok">✓ Mentve</span>}
        {state.error && <span className="admin-form-status admin-form-status-err">{state.error}</span>}
      </div>
    </form>
  );
}
