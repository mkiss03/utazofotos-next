import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { isAdminViewer } from '@/lib/admin-viewer';

/**
 * Lebeg\u0151 "Szerkeszt\u00e9s" gomb a publikus oldalak jobb als\u00f3 sark\u00e1ban.
 * Csak akkor renderelődik, ha a l\u00e1togat\u00f3 be van jelentkezve adminként \u2014
 * ezzel adunk gyors átjárót a publikus n\u00e9zetb\u0151l az admin szerkeszt\u0151be.
 */
export async function AdminEditFab({
  href,
  label = 'Oldal szerkesztése',
}: {
  href: string;
  label?: string;
}) {
  const visible = await isAdminViewer();
  if (!visible) return null;

  return (
    <Link href={href} className="admin-edit-fab" aria-label={label}>
      <Pencil size={18} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}
