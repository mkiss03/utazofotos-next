'use client';

import { useEffect, useRef, useState } from 'react';

export type AutoSaveStatus =
  | 'idle' // nincs változás
  | 'dirty' // van nem mentett változás
  | 'saving' // épp ment
  | 'saved' // sikeresen mentve (rövid ideig mutatva, aztán idle)
  | 'error'; // hiba történt

/**
 * Egyszerű debounce-olt auto-save hook.
 * - A `value` változására automatikusan menti.
 * - `delayMs` után, ha közben nincs új változás, hívja a `saver`-t.
 * - Az állapotból az UI tudja jelezni a mentés állapotát.
 */
export function useAutoSave<T>(
  value: T,
  saver: (v: T) => Promise<{ ok: boolean; error?: string } | void>,
  options: { delayMs?: number; enabled?: boolean } = {},
) {
  const { delayMs = 1500, enabled = true } = options;
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [error, setError] = useState<string | undefined>();
  const lastSavedRef = useRef<T>(value);
  const isFirstRunRef = useRef(true);
  const savingRef = useRef(false);
  const pendingValueRef = useRef<T>(value);

  // Mindig a legfrissebb értéket tartjuk a saver számára.
  pendingValueRef.current = value;

  useEffect(() => {
    if (!enabled) return;
    // Az első futáskor (mount) még nincs változás → ne mentsünk.
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      lastSavedRef.current = value;
      return;
    }
    // Ha a jelenlegi érték megegyezik az utoljára mentettel, nincs teendő.
    if (Object.is(value, lastSavedRef.current)) return;

    setStatus('dirty');
    const handle = setTimeout(async () => {
      // Ha közben már fut egy mentés, várjunk a következő ciklusra.
      if (savingRef.current) return;
      savingRef.current = true;
      setStatus('saving');
      try {
        const snapshot = pendingValueRef.current;
        const res = await saver(snapshot);
        if (res && res.ok === false) {
          setStatus('error');
          setError(res.error ?? 'Hiba történt a mentés során.');
        } else {
          lastSavedRef.current = snapshot;
          setStatus('saved');
          setError(undefined);
          // Pár másodperc után visszatérünk az "idle" állapotra,
          // hacsak közben nem érkezett új változás.
          setTimeout(() => {
            setStatus((s) => (s === 'saved' ? 'idle' : s));
          }, 2000);
        }
      } catch (e) {
        setStatus('error');
        setError(e instanceof Error ? e.message : 'Ismeretlen hiba.');
      } finally {
        savingRef.current = false;
      }
    }, delayMs);

    return () => clearTimeout(handle);
  }, [value, enabled, delayMs, saver]);

  return { status, error };
}
