'use client';

import { Check, Loader2, AlertCircle } from 'lucide-react';
import type { AutoSaveStatus } from './useAutoSave';

/**
 * Vizuális jelző az auto-save állapotához. Idős-barát:
 * mindig egyértelműen látszik, hogy a változások biztonságban vannak-e.
 */
export function AutoSaveBadge({
  status,
  error,
}: {
  status: AutoSaveStatus;
  error?: string;
}) {
  if (status === 'idle') {
    return (
      <span className="admin-autosave admin-autosave-idle" aria-live="polite">
        <Check size={14} aria-hidden="true" />
        Minden mentve
      </span>
    );
  }
  if (status === 'dirty') {
    return (
      <span className="admin-autosave admin-autosave-dirty" aria-live="polite">
        Mentésre vár…
      </span>
    );
  }
  if (status === 'saving') {
    return (
      <span className="admin-autosave admin-autosave-saving" aria-live="polite">
        <Loader2 size={14} className="admin-spin" aria-hidden="true" />
        Mentés folyamatban…
      </span>
    );
  }
  if (status === 'saved') {
    return (
      <span className="admin-autosave admin-autosave-ok" aria-live="polite">
        <Check size={14} aria-hidden="true" />
        Mentve
      </span>
    );
  }
  return (
    <span className="admin-autosave admin-autosave-error" role="alert">
      <AlertCircle size={14} aria-hidden="true" />
      {error ?? 'Hiba a mentés során'}
    </span>
  );
}
