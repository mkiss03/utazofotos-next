'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPinned,
  CalendarDays,
  Mailbox,
  Image as ImageIcon,
  FileText,
  Settings,
  Menu,
  X,
} from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Áttekintés', icon: LayoutDashboard },
  { href: '/admin/uticelok', label: 'Úticélok', icon: MapPinned },
  { href: '/admin/indulasok', label: 'Indulások', icon: CalendarDays },
  { href: '/admin/foglalasok', label: 'Foglalások', icon: Mailbox },
  { href: '/admin/media', label: 'Médiatár', icon: ImageIcon },
  { href: '/admin/oldalak', label: 'Oldalak', icon: FileText },
  { href: '/admin/beallitasok', label: 'Beállítások', icon: Settings },
] as const;

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Bezárjuk a mobilmenüt útvonalváltáskor.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className="admin-mobile-toggle"
        onClick={() => setOpen(true)}
        aria-label="Menü megnyitása"
      >
        <Menu size={24} />
        <span>Menü</span>
      </button>

      {open && (
        <>
          <div
            className="admin-mobile-backdrop"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav className="admin-mobile-drawer" aria-label="Admin menü">
            <button
              type="button"
              className="admin-mobile-close"
              onClick={() => setOpen(false)}
              aria-label="Menü bezárása"
            >
              <X size={20} />
            </button>
            <ul>
              {NAV.map(({ href, label, icon: Icon }) => {
                const active =
                  href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`admin-mobile-link ${active ? 'is-active' : ''}`}
                    >
                      <Icon size={20} aria-hidden="true" />
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      )}
    </>
  );
}
