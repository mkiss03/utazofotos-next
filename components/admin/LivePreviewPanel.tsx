'use client';

import { useState, useRef } from 'react';
import { Eye, EyeOff, RefreshCw, ExternalLink } from 'lucide-react';

/**
 * Élő előnézet panel — iframe-ben mutatja a publikus úticél oldalt.
 * A felhasználó a "Frissít" gombbal töltheti újra a tartalom mentése után,
 * vagy be/kikapcsolhatja az előnézetet, ha kis képernyőn dolgozik.
 */
export function LivePreviewPanel({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const previewUrl = `/uticelok/${slug}?embed=1`;

  function reload() {
    // A reloadKey változtatása újra létrehozza az iframe-et — biztosabb,
    // mint a contentWindow.location.reload() (CORS kerülendő).
    setReloadKey((k) => k + 1);
  }

  return (
    <div className={`admin-preview ${open ? 'admin-preview-open' : ''}`}>
      <div className="admin-preview-bar">
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => setOpen((v) => !v)}
          title={open ? 'Előnézet elrejtése' : 'Élő előnézet megnyitása'}
        >
          {open ? <EyeOff size={14} /> : <Eye size={14} />}
          {open ? 'Előnézet bezárása' : 'Élő előnézet'}
        </button>

        {open && (
          <>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={reload}
              title="Előnézet frissítése"
            >
              <RefreshCw size={14} />
              Frissít
            </button>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn admin-btn-secondary"
              title="Megnyitás új ablakban"
            >
              <ExternalLink size={14} />
              Új ablak
            </a>
            <span className="admin-preview-hint">
              Mentés után kattints a Frissít gombra, hogy lásd a változást.
            </span>
          </>
        )}
      </div>

      {open && (
        <div className="admin-preview-frame">
          <iframe
            key={reloadKey}
            ref={iframeRef}
            src={previewUrl}
            title="Élő előnézet"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
