import Image from 'next/image';
import { Facebook } from 'lucide-react';
import { FB_URL } from './TopBar';

export function FBanner() {
  return (
    <div className="f-banner">
      <Image
        src="/images/banner.jpg"
        alt=""
        fill
        sizes="100vw"
        style={{ objectFit: 'cover' }}
      />
    </div>
  );
}

export function Footer({ withFb = true }: { withFb?: boolean }) {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="f-copy">© {year} UtazóFotós | Minden jog fenntartva</div>
      {withFb && (
        <a className="f-fb" href={FB_URL} target="_blank" rel="noopener noreferrer">
          <Facebook size={14} aria-hidden="true" />
          facebook.com/groups/702270205143442
        </a>
      )}
    </footer>
  );
}
