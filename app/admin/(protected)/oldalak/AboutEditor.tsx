'use client';

import { useState, useTransition, useActionState } from 'react';
import Image from 'next/image';
import { Save, Loader2, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { saveAbout, type SaveState } from './actions';
import type { AboutContent } from '@/lib/site-content';

const initial: SaveState = { ok: false };

export function AboutEditor({ initial: data }: { initial: AboutContent }) {
  const [state, action] = useActionState(saveAbout, initial);
  const [isPending, startTransition] = useTransition();

  const [introLine, setIntroLine] = useState(data.introLine);
  const [title, setTitle] = useState(data.title);
  const [closing, setClosing] = useState(data.closing);
  const [portraitUrl, setPortraitUrl] = useState(data.portraitUrl);
  const [portraitAlt, setPortraitAlt] = useState(data.portraitAlt);
  const [paragraphs, setParagraphs] = useState<string[]>(data.paragraphs);

  function submit(fd: FormData) {
    fd.set('paragraphs', JSON.stringify(paragraphs));
    startTransition(() => action(fd));
  }

  function updatePara(idx: number, value: string) {
    setParagraphs((prev) => prev.map((p, i) => (i === idx ? value : p)));
  }
  function removePara(idx: number) {
    if (paragraphs.length <= 1) return;
    if (!confirm('Biztosan törlöd ezt a bekezdést?')) return;
    setParagraphs((prev) => prev.filter((_, i) => i !== idx));
  }
  function addPara() {
    setParagraphs((prev) => [...prev, '']);
  }
  function move(idx: number, dir: -1 | 1) {
    const next = idx + dir;
    if (next < 0 || next >= paragraphs.length) return;
    setParagraphs((prev) => {
      const copy = [...prev];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      return copy;
    });
  }

  return (
    <form className="admin-form-grid" action={submit}>
      <div className="admin-field">
        <label htmlFor="about-intro">Felső sor (a hős sávban)</label>
        <input
          id="about-intro"
          name="introLine"
          type="text"
          value={introLine}
          onChange={(e) => setIntroLine(e.target.value)}
        />
      </div>
      <div className="admin-field">
        <label htmlFor="about-title">Cím (a tartalmi részben)</label>
        <input
          id="about-title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="admin-field admin-field-wide">
        <label>Profilkép</label>
        <input type="hidden" name="portraitUrl" value={portraitUrl} />
        <input type="hidden" name="portraitAlt" value={portraitAlt} />
        {portraitUrl && (
          <div className="admin-cover-preview admin-cover-preview-sm">
            <Image src={portraitUrl} alt={portraitAlt || 'Portré'} fill sizes="300px" unoptimized />
          </div>
        )}
        <MediaPicker
          onPick={({ url, alt }) => {
            setPortraitUrl(url);
            if (alt) setPortraitAlt(alt);
          }}
          buttonLabel="Profilkép választása"
        />
      </div>
      <div className="admin-field admin-field-wide">
        <label htmlFor="about-portrait-alt">Profilkép alt szövege</label>
        <input
          id="about-portrait-alt"
          type="text"
          value={portraitAlt}
          onChange={(e) => setPortraitAlt(e.target.value)}
        />
      </div>

      <div className="admin-field admin-field-wide">
        <label>Bekezdések</label>
        <div className="admin-paragraphs">
          {paragraphs.map((p, idx) => (
            <div key={idx} className="admin-paragraph-row">
              <textarea
                rows={4}
                value={p}
                onChange={(e) => updatePara(idx, e.target.value)}
                placeholder={`${idx + 1}. bekezdés`}
              />
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
                  disabled={idx === paragraphs.length - 1}
                  aria-label="Lejjebb"
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  type="button"
                  className="admin-icon-btn admin-icon-btn-danger"
                  onClick={() => removePara(idx)}
                  disabled={paragraphs.length <= 1}
                  aria-label="Törlés"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="admin-btn admin-btn-secondary" onClick={addPara}>
            <Plus size={14} /> Új bekezdés
          </button>
        </div>
      </div>

      <div className="admin-field admin-field-wide">
        <label htmlFor="about-closing">Záró sor</label>
        <input
          id="about-closing"
          name="closing"
          type="text"
          value={closing}
          onChange={(e) => setClosing(e.target.value)}
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
