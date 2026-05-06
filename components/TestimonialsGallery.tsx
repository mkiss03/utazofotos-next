'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Quote,
  Star,
  Pause,
  Play,
} from 'lucide-react';
import type { TestimonialsContent } from '@/lib/site-content';

const AUTO_MS = 6500;

export function TestimonialsGallery({ data }: { data: TestimonialsContent }) {
  const items = data.items;
  const count = items.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  const goto = useCallback(
    (i: number) => {
      if (count === 0) return;
      setActive(((i % count) + count) % count);
      startRef.current = null;
      setProgress(0);
    },
    [count],
  );
  const prev = useCallback(() => goto(active - 1), [active, goto]);
  const next = useCallback(() => goto(active + 1), [active, goto]);

  // Automatikus váltás progress bar-ral
  useEffect(() => {
    if (paused || count <= 1) return;
    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const p = Math.min(1, elapsed / AUTO_MS);
      setProgress(p);
      if (p >= 1) {
        startRef.current = null;
        setActive((a) => (a + 1) % count);
        setProgress(0);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [paused, count, active]);

  // Billentyű navigáció
  const rootRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (!el.matches(':hover') && document.activeElement?.closest('.tg2') !== el)
        return;
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next]);

  const visible = useMemo(() => {
    // 5 cella körülötte (hogy 2-2 oldalt jelenjen meg)
    const out: Array<{ idx: number; rel: number }> = [];
    for (let r = -2; r <= 2; r++) {
      const idx = ((active + r) % count + count) % count;
      out.push({ idx, rel: r });
    }
    return out;
  }, [active, count]);

  if (count === 0) return null;

  return (
    <section
      ref={rootRef}
      className="tg2"
      aria-roledescription="carousel"
      aria-label={data.title}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="tg2-head">
        <h2 className="tg2-title">{data.title}</h2>
        {data.subtitle && <p className="tg2-sub">{data.subtitle}</p>}
      </div>

      <div className="tg2-stage" aria-live="polite">
        {visible.map(({ idx, rel }) => {
          const it = items[idx];
          const isActive = rel === 0;
          return (
            <article
              key={`${idx}-${rel}`}
              className={`tg2-card rel-${rel} ${isActive ? 'is-active' : ''}`}
              aria-hidden={!isActive}
              onClick={() => {
                if (rel !== 0) goto(idx);
              }}
              role={rel !== 0 ? 'button' : undefined}
              tabIndex={rel !== 0 ? 0 : -1}
              onKeyDown={(e) => {
                if (rel !== 0 && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  goto(idx);
                }
              }}
            >
              <div className="tg2-card-photo">
                <Image
                  src={it.photoUrl}
                  alt={it.photoAlt || it.name}
                  fill
                  sizes="(max-width: 720px) 92vw, 520px"
                  className="tg2-card-img"
                />
                <div className="tg2-card-shade" />
                {isActive && (
                  <div className="tg2-card-quote-wrap">
                    <Quote
                      className="tg2-card-quote-icon"
                      size={28}
                      aria-hidden="true"
                    />
                    <blockquote className="tg2-card-quote">
                      {it.quote}
                    </blockquote>
                  </div>
                )}
              </div>
              <footer className="tg2-card-foot">
                <div className="tg2-card-name">
                  <strong>{it.name}</strong>
                  <span className="tg2-card-trip">{it.trip}</span>
                </div>
                {it.rating && (
                  <div
                    className="tg2-card-stars"
                    aria-label={`${it.rating} csillagos értékelés`}
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < (it.rating ?? 0) ? 'is-on' : ''}
                        fill={i < (it.rating ?? 0) ? 'currentColor' : 'none'}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                )}
              </footer>
            </article>
          );
        })}

        <button
          type="button"
          className="tg2-nav tg2-nav-prev"
          onClick={prev}
          aria-label="Előző vélemény"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          className="tg2-nav tg2-nav-next"
          onClick={next}
          aria-label="Következő vélemény"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      <div className="tg2-bottom">
        <button
          type="button"
          className="tg2-pause"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? 'Lejátszás' : 'Szünet'}
          aria-pressed={paused}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <div className="tg2-dots" role="tablist">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`${i + 1}. – ${it.name}`}
              className={`tg2-dot ${i === active ? 'is-active' : ''}`}
              onClick={() => goto(i)}
            >
              {i === active && (
                <span
                  className="tg2-dot-progress"
                  style={{ width: `${progress * 100}%` }}
                />
              )}
            </button>
          ))}
        </div>
        <span className="tg2-counter" aria-hidden="true">
          {active + 1} / {count}
        </span>
      </div>
    </section>
  );
}
