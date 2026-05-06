'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save,
  Loader2,
  Maximize,
} from 'lucide-react';
import { uploadCroppedImage } from '@/app/admin/(protected)/media/actions';

/**
 * Borítókép szerkesztő modal: nagyítás / kicsinyítés / mozgatás / oldalarány választás.
 * Mentéskor canvas-en újrarajzolja és új médiatár-bejegyzésként feltölti.
 */

type AspectKey = '16:9' | '4:3' | '1:1' | '3:2' | 'free';

const ASPECTS: Array<{ key: AspectKey; label: string; ratio: number | null }> = [
  { key: '16:9', label: '16:9', ratio: 16 / 9 },
  { key: '4:3', label: '4:3', ratio: 4 / 3 },
  { key: '3:2', label: '3:2', ratio: 3 / 2 },
  { key: '1:1', label: '1:1', ratio: 1 },
  { key: 'free', label: 'Eredeti', ratio: null },
];

const VIEWPORT_W = 520; // a modal vászon szélessége px-ben

export function ImageEditorModal({
  sourceUrl,
  initialAlt = '',
  onClose,
  onSaved,
}: {
  sourceUrl: string;
  initialAlt?: string;
  onClose: () => void;
  onSaved: (newUrl: string, alt: string) => void;
}) {
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [aspectKey, setAspectKey] = useState<AspectKey>('16:9');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startOX: number;
    startOY: number;
  }>({ active: false, startX: 0, startY: 0, startOX: 0, startOY: 0 });

  // Esc bezárás + body scroll lock
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape' && !isSaving) onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, isSaving]);

  // Kép betöltése crossOrigin-nal a canvas exporthoz
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImgEl(img);
    img.onerror = () =>
      setLoadError(
        'A kép nem tölthető be szerkesztéshez (CORS vagy hálózati hiba).',
      );
    // Cache-bypass paraméter, hogy a böngésző crossOrigin-os választ kapjon
    const sep = sourceUrl.includes('?') ? '&' : '?';
    img.src = `${sourceUrl}${sep}edit=1`;
  }, [sourceUrl]);

  const aspect = ASPECTS.find((a) => a.key === aspectKey)!;

  const naturalSize = useMemo(() => {
    if (!imgEl) return { w: 0, h: 0 };
    return { w: imgEl.naturalWidth, h: imgEl.naturalHeight };
  }, [imgEl]);

  // Container méretek (a kiválasztott arány alapján)
  const containerSize = useMemo(() => {
    if (!imgEl) return { w: VIEWPORT_W, h: Math.round(VIEWPORT_W / (16 / 9)) };
    const r = aspect.ratio ?? naturalSize.w / naturalSize.h;
    return { w: VIEWPORT_W, h: Math.round(VIEWPORT_W / r) };
  }, [aspect.ratio, imgEl, naturalSize]);

  // "Cover" alap-szorzó: hogy a kép legalább a containert lefedje
  const baseScale = useMemo(() => {
    if (!naturalSize.w || !naturalSize.h) return 1;
    return Math.max(
      containerSize.w / naturalSize.w,
      containerSize.h / naturalSize.h,
    );
  }, [containerSize, naturalSize]);

  const effectiveScale = baseScale * zoom;
  const displayedW = naturalSize.w * effectiveScale;
  const displayedH = naturalSize.h * effectiveScale;

  // Ha az arány vagy zoom változik, a megengedett offset tartomány is változik;
  // korlátozzuk az offsetet, hogy ne lehessen kihúzni a képet a containerből.
  const clampOffset = (x: number, y: number) => {
    const minX = containerSize.w - displayedW;
    const minY = containerSize.h - displayedH;
    const cx = Math.min(0, Math.max(minX, x));
    const cy = Math.min(0, Math.max(minY, y));
    return { x: cx, y: cy };
  };

  // Reset / centrálás amikor a kép vagy arány változik
  useEffect(() => {
    if (!imgEl) return;
    setZoom(1);
    const cx = (containerSize.w - displayedW) / 2;
    const cy = (containerSize.h - displayedH) / 2;
    setOffset({ x: cx, y: cy });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgEl, aspectKey]);

  // Zoom változáskor centrum-tartó újraskálázás
  const lastZoomRef = useRef(zoom);
  useEffect(() => {
    if (!imgEl) return;
    const oldZoom = lastZoomRef.current;
    if (oldZoom === zoom) return;

    // A container közepéhez igazítjuk a zoomot
    const cx = containerSize.w / 2;
    const cy = containerSize.h / 2;
    // a kép pontja a container közepén előzőleg
    const oldEff = baseScale * oldZoom;
    const px = (cx - offset.x) / oldEff;
    const py = (cy - offset.y) / oldEff;
    const newEff = baseScale * zoom;
    const nx = cx - px * newEff;
    const ny = cy - py * newEff;
    const newDispW = naturalSize.w * newEff;
    const newDispH = naturalSize.h * newEff;
    const minX = containerSize.w - newDispW;
    const minY = containerSize.h - newDispH;
    setOffset({
      x: Math.min(0, Math.max(minX, nx)),
      y: Math.min(0, Math.max(minY, ny)),
    });
    lastZoomRef.current = zoom;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  // Drag handlers
  const onPointerDown = (e: React.PointerEvent) => {
    if (!imgEl) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startOX: offset.x,
      startOY: offset.y,
    };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset(clampOffset(dragRef.current.startOX + dx, dragRef.current.startOY + dy));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current.active = false;
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    if (!imgEl) return;
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    setZoom((z) => Math.min(4, Math.max(1, z + delta)));
  };

  const handleReset = () => {
    setZoom(1);
    if (imgEl) {
      const cx = (containerSize.w - displayedW) / 2;
      const cy = (containerSize.h - displayedH) / 2;
      setOffset({ x: cx, y: cy });
    }
  };

  const handleSave = async () => {
    if (!imgEl) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      // A jelenleg látható natúr-rect kiszámítása
      const natX = -offset.x / effectiveScale;
      const natY = -offset.y / effectiveScale;
      const natW = containerSize.w / effectiveScale;
      const natH = containerSize.h / effectiveScale;

      // Kimeneti méret: max 1920 szélesség (vagy a natúr-rect, ha kisebb)
      const TARGET_W = Math.min(1920, Math.round(natW));
      const ratio = containerSize.w / containerSize.h;
      const TARGET_H = Math.round(TARGET_W / ratio);

      const canvas = document.createElement('canvas');
      canvas.width = TARGET_W;
      canvas.height = TARGET_H;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas nem támogatott.');

      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(imgEl, natX, natY, natW, natH, 0, 0, TARGET_W, TARGET_H);

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9),
      );
      if (!blob) throw new Error('A kép kódolása nem sikerült.');

      const filename = `crop-${Date.now()}.jpg`;
      const file = new File([blob], filename, { type: 'image/jpeg' });

      const fd = new FormData();
      fd.set('file', file);
      fd.set('alt', initialAlt);

      const res = await uploadCroppedImage(fd);
      if (!res.ok) {
        setSaveError(res.error);
        setIsSaving(false);
        return;
      }
      onSaved(res.url, res.alt);
    } catch (e) {
      setSaveError(
        e instanceof Error
          ? e.message
          : 'Ismeretlen hiba a mentés közben.',
      );
      setIsSaving(false);
    }
  };

  return (
    <div
      className="ied-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Kép szerkesztése"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div className="ied-modal">
        <header className="ied-head">
          <h3>Kép szerkesztése</h3>
          <button
            type="button"
            className="ied-close"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Bezárás"
          >
            <X size={20} />
          </button>
        </header>

        <div className="ied-body">
          {loadError ? (
            <div className="ied-error">
              {loadError}
              <p style={{ marginTop: 8, fontSize: '.85rem', opacity: 0.8 }}>
                Tipp: csak olyan képet lehet szerkeszteni, ami a médiatárba van
                feltöltve (Supabase) vagy ugyanarról a domainről jön.
              </p>
            </div>
          ) : (
            <>
              <div
                ref={containerRef}
                className="ied-viewport"
                style={{ width: containerSize.w, height: containerSize.h }}
                onWheel={onWheel}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                {imgEl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={imgEl.src}
                    alt=""
                    draggable={false}
                    style={{
                      position: 'absolute',
                      width: displayedW,
                      height: displayedH,
                      transform: `translate(${offset.x}px, ${offset.y}px)`,
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  />
                ) : (
                  <div className="ied-loading">
                    <Loader2 size={28} className="admin-spin" />
                    <span>Kép betöltése…</span>
                  </div>
                )}
                <div className="ied-grid" aria-hidden="true" />
              </div>

              <div className="ied-controls">
                <div className="ied-control-row">
                  <label className="ied-control-label">
                    <Maximize size={14} aria-hidden="true" />
                    Oldalarány
                  </label>
                  <div className="ied-aspects" role="tablist">
                    {ASPECTS.map((a) => (
                      <button
                        key={a.key}
                        type="button"
                        role="tab"
                        aria-selected={aspectKey === a.key}
                        className={`ied-aspect ${aspectKey === a.key ? 'is-active' : ''}`}
                        onClick={() => setAspectKey(a.key)}
                        disabled={isSaving}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ied-control-row">
                  <label className="ied-control-label" htmlFor="ied-zoom">
                    <ZoomIn size={14} aria-hidden="true" />
                    Nagyítás
                  </label>
                  <button
                    type="button"
                    className="ied-icon-btn"
                    onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
                    disabled={isSaving || zoom <= 1}
                    aria-label="Kicsinyítés"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <input
                    id="ied-zoom"
                    type="range"
                    min={1}
                    max={4}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    disabled={isSaving}
                    className="ied-slider"
                  />
                  <button
                    type="button"
                    className="ied-icon-btn"
                    onClick={() => setZoom((z) => Math.min(4, +(z + 0.1).toFixed(2)))}
                    disabled={isSaving || zoom >= 4}
                    aria-label="Nagyítás"
                  >
                    <ZoomIn size={16} />
                  </button>
                  <span className="ied-zoom-num">{Math.round(zoom * 100)}%</span>
                </div>
              </div>
            </>
          )}

          {saveError && <div className="ied-error">{saveError}</div>}
        </div>

        <footer className="ied-foot">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={handleReset}
            disabled={isSaving || !imgEl}
          >
            <RotateCcw size={14} aria-hidden="true" />
            Visszaállítás
          </button>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Mégse
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleSave}
            disabled={isSaving || !imgEl}
          >
            {isSaving ? (
              <Loader2 size={14} className="admin-spin" aria-hidden="true" />
            ) : (
              <Save size={14} aria-hidden="true" />
            )}
            Mentés új képként
          </button>
        </footer>
      </div>
    </div>
  );
}
