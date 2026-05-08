import Image from 'next/image';
import { Facebook, Instagram } from 'lucide-react';
import { getSiteContent } from '@/lib/site-content';

function TikTokIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05Z" />
    </svg>
  );
}

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

export async function Footer({ withSocial = true }: { withSocial?: boolean }) {
  const year = new Date().getFullYear();
  const contact = withSocial ? await getSiteContent('contact') : null;
  return (
    <footer>
      <div className="f-copy">© {year} UtazóFotós | Minden jog fenntartva</div>
      {withSocial && contact && (
        <div className="f-social">
          {contact.facebookUrl && (
            <a className="f-fb" href={contact.facebookUrl} target="_blank" rel="noopener noreferrer">
              <Facebook size={14} aria-hidden="true" />
              {contact.facebookLabel || 'Facebook'}
            </a>
          )}
          {contact.instagramUrl && (
            <a className="f-ig" href={contact.instagramUrl} target="_blank" rel="noopener noreferrer">
              <Instagram size={14} aria-hidden="true" />
              {contact.instagramLabel || 'Instagram'}
            </a>
          )}
          {contact.tiktokUrl && (
            <a className="f-tt" href={contact.tiktokUrl} target="_blank" rel="noopener noreferrer">
              <TikTokIcon size={14} />
              {contact.tiktokLabel || 'TikTok'}
            </a>
          )}
        </div>
      )}
    </footer>
  );
}
