'use client';

import { useState, useTransition, useCallback, useMemo } from 'react';
import Image from 'next/image';
import {
  Save,
  Loader2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Heading2,
  Pilcrow,
  List as ListIcon,
  ImageIcon,
  Plus,
  X,
  ImageOff,
} from 'lucide-react';
import type { DestinationBodyBlock } from '@/lib/db/schema';
import { updateDestinationBody } from './body-actions';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { useAutoSave } from '@/components/admin/useAutoSave';
import { AutoSaveBadge } from '@/components/admin/AutoSaveBadge';

type Props = {
  destinationId: string;
  slug: string;
  initialBody: DestinationBodyBlock[];
};

type Status = { ok: boolean; error?: string } | null;

/** Egyedi azonosító az újonnan létrehozott blokkokhoz (csak kliens-state-ben). */
function uid() {
  return Math.random().toString(36).slice(2, 10);
}
type WithKey<T> = T & { _key: string };
type Block = WithKey<DestinationBodyBlock>;

function withKeys(blocks: DestinationBodyBlock[]): Block[] {
  return blocks.map((b) => ({ ...b, _key: uid() }) as Block);
}

function stripKeys(blocks: Block[]): DestinationBodyBlock[] {
  return blocks.map(({ _key, ...rest }) => rest as DestinationBodyBlock);
}

export function BodyBlocksEditor({ destinationId, slug, initialBody }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(() => withKeys(initialBody ?? []));
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>(null);
  const [dirty, setDirty] = useState(false);

  // Auto-save: a JSON-osított blokkokat figyeljük — így a memóriacím-változás
  // miatt nem mentünk újra meg újra (csak valódi tartalomváltozásnál).
  const serialized = useMemo(() => JSON.stringify(stripKeys(blocks)), [blocks]);
  const autoSaver = useCallback(
    async (snapshot: string) => {
      const parsed = JSON.parse(snapshot) as DestinationBodyBlock[];
      const res = await updateDestinationBody(destinationId, slug, parsed);
      if (res.ok) setDirty(false);
      return res;
    },
    [destinationId, slug],
  );
  const auto = useAutoSave(serialized, autoSaver, { delayMs: 1800 });

  function update(idx: number, next: Block) {
    const copy = blocks.slice();
    copy[idx] = next;
    setBlocks(copy);
    setDirty(true);
  }
  function remove(idx: number) {
    setBlocks(blocks.filter((_, i) => i !== idx));
    setDirty(true);
  }
  function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= blocks.length) return;
    const copy = blocks.slice();
    [copy[idx], copy[j]] = [copy[j], copy[idx]];
    setBlocks(copy);
    setDirty(true);
  }
  function add(type: DestinationBodyBlock['type']) {
    let block: Block;
    switch (type) {
      case 'h2':
        block = { type: 'h2', text: '', _key: uid() };
        break;
      case 'p':
        block = { type: 'p', text: '', _key: uid() };
        break;
      case 'ul':
        block = { type: 'ul', items: [''], _key: uid() };
        break;
      case 'image':
        block = { type: 'image', src: '', alt: '', _key: uid() };
        break;
    }
    setBlocks([...blocks, block]);
    setDirty(true);
  }

  function save() {
    setStatus(null);
    startTransition(async () => {
      const res = await updateDestinationBody(
        destinationId,
        slug,
        stripKeys(blocks),
      );
      setStatus(res);
      if (res.ok) setDirty(false);
    });
  }

  return (
    <div className="admin-blocks-editor">
      {blocks.length === 0 ? (
        <div className="admin-blocks-empty">
          <p>Még nincs egyetlen tartalmi blokk sem.</p>
          <p className="admin-field-hint">
            Kezdd egy bekezdéssel vagy egy alcímmel — alább a gombokkal.
          </p>
        </div>
      ) : (
        <ol className="admin-blocks-list">
          {blocks.map((block, i) => (
            <li key={block._key} className="admin-block">
              <div className="admin-block-header">
                <span className="admin-block-type">{blockTypeLabel(block.type)}</span>
                <div className="admin-block-actions">
                  <button
                    type="button"
                    className="admin-icon-btn"
                    aria-label="Mozgatás felfelé"
                    title="Mozgatás felfelé"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-btn"
                    aria-label="Mozgatás lefelé"
                    title="Mozgatás lefelé"
                    disabled={i === blocks.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-btn admin-icon-btn-danger"
                    aria-label="Blokk törlése"
                    title="Blokk törlése"
                    onClick={() => {
                      if (confirm('Biztosan törlöd ezt a blokkot?')) remove(i);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="admin-block-body">
                <BlockBody block={block} onChange={(next) => update(i, next)} />
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="admin-blocks-add">
        <span className="admin-blocks-add-label">Új blokk:</span>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => add('h2')}
        >
          <Heading2 size={16} aria-hidden="true" /> Alcím
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => add('p')}
        >
          <Pilcrow size={16} aria-hidden="true" /> Bekezdés
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => add('ul')}
        >
          <ListIcon size={16} aria-hidden="true" /> Lista
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => add('image')}
        >
          <ImageIcon size={16} aria-hidden="true" /> Kép
        </button>
      </div>

      <div className="admin-form-bar">
        <AutoSaveBadge status={auto.status} error={auto.error} />
        {status?.error && (
          <div className="admin-form-status admin-form-status-error">
            {status.error}
          </div>
        )}
        {dirty && !isPending && auto.status === 'idle' && (
          <div className="admin-form-status admin-form-status-warn">
            Vannak nem mentett változtatások.
          </div>
        )}
        <button
          type="button"
          className="admin-btn admin-btn-primary admin-btn-lg"
          disabled={isPending || (!dirty && auto.status === 'idle')}
          onClick={save}
          title="Kézi mentés (auto-save is be van kapcsolva)"
        >
          {isPending ? (
            <>
              <Loader2 size={18} className="admin-spin" aria-hidden="true" />
              Mentés…
            </>
          ) : (
            <>
              <Save size={18} aria-hidden="true" />
              Blokkok mentése
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function blockTypeLabel(t: DestinationBodyBlock['type']): string {
  switch (t) {
    case 'h2':
      return 'Alcím';
    case 'p':
      return 'Bekezdés';
    case 'ul':
      return 'Felsorolás';
    case 'image':
      return 'Kép';
  }
}

function BlockBody({
  block,
  onChange,
}: {
  block: Block;
  onChange: (next: Block) => void;
}) {
  if (block.type === 'h2') {
    return (
      <input
        type="text"
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="Az alcím szövege"
        maxLength={300}
        className="admin-block-input-h2"
      />
    );
  }
  if (block.type === 'p') {
    return (
      <textarea
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="Bekezdés szövege"
        maxLength={5000}
        rows={4}
      />
    );
  }
  if (block.type === 'ul') {
    return (
      <div className="admin-block-list">
        {block.items.map((item, idx) => (
          <div key={idx} className="admin-block-list-row">
            <span className="admin-block-list-bullet">•</span>
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const items = block.items.slice();
                items[idx] = e.target.value;
                onChange({ ...block, items });
              }}
              placeholder="Lista elem"
              maxLength={500}
            />
            <button
              type="button"
              className="admin-icon-btn"
              aria-label="Elem törlése"
              title="Elem törlése"
              disabled={block.items.length === 1}
              onClick={() => {
                const items = block.items.filter((_, i) => i !== idx);
                onChange({ ...block, items: items.length ? items : [''] });
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => onChange({ ...block, items: [...block.items, ''] })}
        >
          <Plus size={14} aria-hidden="true" /> Új elem
        </button>
      </div>
    );
  }
  // image
  return (
    <div className="admin-block-image">
      <div className="admin-cover-preview admin-cover-preview-sm">
        {block.src ? (
          <Image
            src={block.src}
            alt={block.alt || 'Előnézet'}
            fill
            sizes="240px"
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        ) : (
          <div className="admin-cover-empty">
            <ImageOff size={28} aria-hidden="true" />
            <span>Nincs kép</span>
          </div>
        )}
      </div>
      <div className="admin-block-image-fields">
        <div className="admin-field">
          <label>Kép URL</label>
          <input
            type="text"
            value={block.src}
            onChange={(e) => onChange({ ...block, src: e.target.value })}
            placeholder="/images/peldakep.jpg vagy https://…"
            maxLength={500}
          />
          <div className="admin-field-row" style={{ marginTop: 6 }}>
            <MediaPicker
              onPick={(sel) =>
                onChange({
                  ...block,
                  src: sel.url,
                  alt: block.alt || sel.alt,
                })
              }
            />
          </div>
        </div>
        <div className="admin-field">
          <label>Alt-szöveg</label>
          <input
            type="text"
            value={block.alt}
            onChange={(e) => onChange({ ...block, alt: e.target.value })}
            placeholder="Mit ábrázol a kép?"
            maxLength={200}
          />
        </div>
      </div>
    </div>
  );
}
