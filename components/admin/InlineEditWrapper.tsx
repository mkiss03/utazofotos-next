'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, X } from 'lucide-react';

/**
 * Egy publikus oldal-szakaszt becsomagol, hogy admin nézőként
 * megjelenjen rajta egy lebegő ceruza ikon. Kattintásra modális
 * ablakban jön elő a szerkesztő. Modális bezárás után router.refresh
 * fut, így rögtön látszanak a változások.
 */
export function InlineEditWrapper({
  children,
  label,
  modalTitle,
  editor,
}: {
  children: ReactNode;
  label: string;
  modalTitle: string;
  editor: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleClose = useCallback(() => {
    setOpen(false);
    // Frissítsük a szerveroldali adatokat (revalidatePath már lefutott
    // a mentéskor, ez a router.refresh elhozza az új tartalmat).
    router.refresh();
  }, [router]);

  // Esc lezárja, body görgetést letiltjuk, amíg nyitva van.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose();
    }
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, handleClose]);

  return (
    <div className="editable-region">
      {children}
      <button
        type="button"
        className="editable-pencil"
        onClick={() => setOpen(true)}
        title={label}
        aria-label={label}
      >
        <Pencil size={16} aria-hidden="true" />
        <span className="editable-pencil-label">{label}</span>
      </button>

      {open && (
        <div
          className="inline-edit-overlay"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label={modalTitle}
        >
          <div
            className="inline-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inline-edit-header">
              <h2>{modalTitle}</h2>
              <button
                type="button"
                className="inline-edit-close"
                onClick={handleClose}
                aria-label="Bezárás"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <div className="inline-edit-body">{editor}</div>
            <div className="inline-edit-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handleClose}
              >
                Bezárás
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
