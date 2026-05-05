'use client';

import { useState, useTransition } from 'react';
import { Trash2, Loader2, X } from 'lucide-react';
import { deleteDestination } from './actions';

export function DeleteDestinationButton({
  destinationId,
  destinationTitle,
}: {
  destinationId: string;
  destinationTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const expected = destinationTitle.trim();
  const canDelete = confirmText.trim() === expected;

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteDestination(destinationId);
      } catch (e) {
        setError('A törlés nem sikerült. Próbáld újra.');
      }
    });
  }

  return (
    <>
      <button
        type="button"
        className="admin-btn admin-btn-danger"
        onClick={() => setOpen(true)}
      >
        <Trash2 size={16} aria-hidden="true" />
        Úticél törlése
      </button>

      {open && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="del-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isPending) setOpen(false);
          }}
        >
          <div className="admin-modal">
            <button
              type="button"
              className="admin-modal-close"
              aria-label="Bezárás"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
            <h2 id="del-title" className="admin-modal-title">
              Úticél végleges törlése
            </h2>
            <p>
              Biztosan törölni szeretnéd a(z){' '}
              <strong>„{destinationTitle}"</strong> úticélt?
            </p>
            <p className="admin-field-hint">
              Ezzel együtt törlődnek a hozzá tartozó <strong>indulások</strong>{' '}
              is. Az ezekre érkezett <strong>foglalások megmaradnak</strong>,
              de a hivatkozott indulás üres lesz. A művelet nem visszafordítható.
            </p>
            <div className="admin-field" style={{ marginTop: 16 }}>
              <label htmlFor="del-confirm">
                A megerősítéshez gépeld be az úticél címét pontosan:{' '}
                <code>{expected}</code>
              </label>
              <input
                id="del-confirm"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={isPending}
                autoFocus
              />
            </div>
            {error && <p className="admin-field-error">{error}</p>}
            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Mégse
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={handleDelete}
                disabled={!canDelete || isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="admin-spin" aria-hidden="true" />
                    Törlés…
                  </>
                ) : (
                  <>
                    <Trash2 size={16} aria-hidden="true" />
                    Igen, töröljük
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
