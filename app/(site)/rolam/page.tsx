import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { EditableRegion } from '@/components/admin/EditableRegion';
import { AboutEditor } from '@/app/admin/(protected)/oldalak/AboutEditor';
import { getSiteContent } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Rólam',
  description:
    'Tuza-Göncz Zsuzsanna utazásszervező és fotós – kiscsoportos túrák Olaszországba és más célpontokra.',
};

export const revalidate = 60;
export const dynamic = 'force-dynamic';

export default async function RolamPage() {
  const [about, contact] = await Promise.all([
    getSiteContent('about'),
    getSiteContent('contact'),
  ]);

  return (
    <>
      <EditableRegion
        label="Rólam szakasz szerkesztése"
        modalTitle="Rólam oldal tartalma"
        editor={<AboutEditor initial={about} />}
      >
        <div className="ph">
          <h1>{about.title}</h1>
          <p>{about.introLine}</p>
          <div className="ph-div" />
        </div>
        <div className="about-wrap">
          <div className="about-sticky">
            <div className="about-photo-wrap">
              <Image
                src={about.portraitUrl}
                alt={about.portraitAlt}
                fill
                sizes="(max-width: 720px) 92vw, 320px"
              />
            </div>
            <div className="about-name">Tuza-Göncz Zsuzsanna</div>
            <div className="about-role">Utazásszervező &amp; Fotós</div>
            <div className="about-sidebar-btns">
              <Link className="btn-dark" href="/jelentkezes">
                Foglalj most
              </Link>
              <a
                className="btn-outline-dark"
                href={contact.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook size={14} aria-hidden="true" />
                Facebook csoport
              </a>
              {contact.instagramUrl && (
                <a
                  className="btn-outline-dark"
                  href={contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram size={14} aria-hidden="true" />
                  {contact.instagramLabel || 'Instagram'}
                </a>
              )}
            </div>
          </div>
          <div className="about-content">
            <h2>{about.title}</h2>
            {about.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
            {about.closing && <div className="about-closing">{about.closing}</div>}
          </div>
        </div>
      </EditableRegion>
      <Footer />
    </>
  );
}
