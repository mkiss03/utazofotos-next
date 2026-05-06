'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';

/**
 * Egyszerűbb változat: ha egy szakasz csak link-szerűen ugrik az admin oldalra
 * (nem inline modal), akkor csak ez kell. Ugyanaz a vizuális ceruza, de kattintásra
 * navigál.
 */
export function EditableLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="editable-region">
      {children}
      <Link
        href={href}
        className="editable-pencil"
        title={label}
        aria-label={label}
        prefetch={false}
      >
        <Pencil size={16} aria-hidden="true" />
        <span className="editable-pencil-label">{label}</span>
      </Link>
    </div>
  );
}
