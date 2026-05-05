import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import {
  LayoutDashboard,
  MapPinned,
  CalendarDays,
  Mailbox,
  Image as ImageIcon,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // A bejelentkező oldalt kihagyjuk a sidebar-ból
  // (ott nincs is layout-szülő, mert a /admin/login saját page-en megy).
  // Itt minden /admin alatti oldalra szükség van bejelentkezésre.
  const session = await auth();

  // A login page önmaga is /admin alatt van — a középső login route-ot
  // egyedileg kezeljük: ha nincs session, oda irányítunk.
  // Lentebb tesszük: a login page saját szabad layoutot kap egy nested
  // (auth) groupban, ide pedig csak a védett oldalak kerülnek.
  if (!session?.user) redirect('/admin/login');

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">UF</span>
          <div>
            <div className="admin-brand-title">UtazóFotós</div>
            <div className="admin-brand-sub">Admin felület</div>
          </div>
        </div>

        <nav className="admin-nav">
          <AdminLink href="/admin" icon={<LayoutDashboard size={20} />}>
            Áttekintés
          </AdminLink>
          <AdminLink href="/admin/uticelok" icon={<MapPinned size={20} />}>
            Úticélok
          </AdminLink>
          <AdminLink href="/admin/indulasok" icon={<CalendarDays size={20} />}>
            Indulások
          </AdminLink>
          <AdminLink href="/admin/foglalasok" icon={<Mailbox size={20} />}>
            Foglalások
          </AdminLink>
          <AdminLink href="/admin/media" icon={<ImageIcon size={20} />}>
            Médiatár
          </AdminLink>
          <AdminLink href="/admin/oldalak" icon={<FileText size={20} />}>
            Oldalak
          </AdminLink>
          <AdminLink href="/admin/beallitasok" icon={<Settings size={20} />}>
            Beállítások
          </AdminLink>
        </nav>

        <div className="admin-user">
          <div className="admin-user-name">{session.user.name ?? 'Admin'}</div>
          <div className="admin-user-email">{session.user.email}</div>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/admin/login' });
            }}
          >
            <button type="submit" className="admin-logout">
              <LogOut size={16} /> Kijelentkezés
            </button>
          </form>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-mobile-header">
          <AdminMobileNav />
          <span className="admin-mobile-brand">UtazóFotós Admin</span>
        </header>
        {children}
      </div>
    </div>
  );
}

function AdminLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="admin-nav-link">
      {icon}
      <span>{children}</span>
    </Link>
  );
}
