import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'UtazóFotós – Stílusos utak megfizethető áron',
    template: '%s | UtazóFotós',
  },
  description:
    'Kiscsoportos utazások Olaszországba és más célpontokra – kulturális programok, gasztronómiai élmények és gyönyörű fotók Tuza-Göncz Zsuzsannával.',
  openGraph: {
    title: 'UtazóFotós – Stílusos utak megfizethető áron',
    description:
      'Kiscsoportos utazások Olaszországba és más célpontokra Tuza-Göncz Zsuzsannával.',
    type: 'website',
    locale: 'hu_HU',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}
