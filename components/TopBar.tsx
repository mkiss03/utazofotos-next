import { Facebook, Instagram } from 'lucide-react';
import { getSiteContent } from '@/lib/site-content';

export async function TopBar() {
  const contact = await getSiteContent('contact');
  return (
    <div className="topbar">
      <div className="topbar-inner">
        {contact.facebookUrl && (
          <a href={contact.facebookUrl} target="_blank" rel="noopener noreferrer">
            <Facebook size={14} aria-hidden="true" />
            <span>{contact.facebookLabel || 'Facebook'}</span>
          </a>
        )}
        {contact.instagramUrl && (
          <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer">
            <Instagram size={14} aria-hidden="true" />
            <span>{contact.instagramLabel || 'Instagram'}</span>
          </a>
        )}
      </div>
    </div>
  );
}
