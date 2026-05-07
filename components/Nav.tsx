'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const links = [
  { href: '/', label: 'Kezdőlap' },
  { href: '/uticelok', label: 'Úticélok' },
  { href: '/menetrend', label: 'Éves menetrend' },
  { href: '/rolam', label: 'Rólam' },
  { href: '/jelentkezes', label: 'Jelentkezés' },
  { href: '/kapcsolat', label: 'Kapcsolat' },
];

const leftLinks = links.slice(0, 3);
const rightLinks = links.slice(3);

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className={`main-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <ul className="nav-links nav-links-left">
            {leftLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={isActive(pathname, l.href) ? 'active' : ''}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link href="/" className="nav-logo" aria-label="UtazóFotós kezdőlap">
            <Image
              src="/images/logo.png"
              alt="UtazóFotós"
              width={88}
              height={88}
              priority
              className="nav-logo-img"
            />
          </Link>

          <ul className="nav-links nav-links-right">
            {rightLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={isActive(pathname, l.href) ? 'active' : ''}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className={`hamburger${open ? ' open' : ''}`}
            aria-label="Menü"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div id="mobile-menu" className={`mobile-menu${open ? ' open' : ''}`}>
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
      </div>
    </>
  );
}
