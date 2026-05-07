import Image from 'next/image';
import { Facebook, Instagram } from 'lucide-react';
import { getSiteContent } from '@/lib/site-content';

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
        </div>
      )}
    </footer>
  );
}
