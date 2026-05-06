import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  MapPinned,
  CalendarDays,
  Mailbox,
  Settings,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { isAdminViewer } from '@/lib/admin-viewer';
import { signOut } from '@/auth';

/**
 * WordPress-stílusú lebegő admin sáv. Csak akkor renderel, ha a látogató
 * be van jelentkezve. A publikus oldalon megjelenik, gyors hozzáférést
 * adva az admin menühöz, az aktuális oldal szerkesztőjéhez és kijelentkezéshez.
 *
 * NEM ad jogot semmihez — csak a (protected) admin layout véd. Ez itt csak
 * navigációs segédeszköz.
 */
export async function AdminBar() {
  const isAdmin = await isAdminViewer();
  if (!isAdmin) return null;

  return (
    <div className="adminbar" role="navigation" aria-label="Admin gyorsmenü">
      <Link href="/admin" className="adminbar-link adminbar-brand" title="Admin áttekintés">
        <LayoutDashboard size={14} aria-hidden="true" />
        <span>UtazóFotós Admin</span>
      </Link>
      <span className="adminbar-sep" aria-hidden="true" />
      <Link href="/admin/oldalak" className="adminbar-link" title="Oldalak tartalma">
        <FileText size={14} aria-hidden="true" />
        <span>Oldalak</span>
      </Link>
      <Link href="/admin/uticelok" className="adminbar-link" title="Úticélok kezelése">
        <MapPinned size={14} aria-hidden="true" />
        <span>Úticélok</span>
      </Link>
      <Link href="/admin/indulasok" className="adminbar-link" title="Indulások">
        <CalendarDays size={14} aria-hidden="true" />
        <span>Indulások</span>
      </Link>
      <Link href="/admin/foglalasok" className="adminbar-link" title="Foglalások">
        <Mailbox size={14} aria-hidden="true" />
        <span>Foglalások</span>
      </Link>
      <Link href="/admin/media" className="adminbar-link" title="Médiatár">
        <ImageIcon size={14} aria-hidden="true" />
        <span>Médiatár</span>
      </Link>
      <Link href="/admin/beallitasok" className="adminbar-link" title="Beállítások">
        <Settings size={14} aria-hidden="true" />
        <span>Beállítások</span>
      </Link>
      <span className="adminbar-spacer" />
      <Link
        href="/"
        className="adminbar-link adminbar-link-soft"
        title="Webhely megnyitása új lapon"
        target="_blank"
        prefetch={false}
      >
        <ExternalLink size={14} aria-hidden="true" />
        <span>Webhely</span>
      </Link>
      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/admin/login' });
        }}
      >
        <button type="submit" className="adminbar-link adminbar-link-out" title="Kijelentkezés">
          <LogOut size={14} aria-hidden="true" />
          <span>Kilépés</span>
        </button>
      </form>
    </div>
  );
}
