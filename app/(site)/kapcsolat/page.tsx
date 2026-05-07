import type { Metadata } from 'next';
import Image from 'next/image';
import { Phone, Mail, Facebook, Instagram } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { ContactForm } from '@/components/ContactForm';
import { EditableRegion } from '@/components/admin/EditableRegion';
import { ContactEditor } from '@/app/admin/(protected)/beallitasok/ContactEditor';
import { getSiteContent } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Kapcsolat',
  description:
    'Vedd fel velem a kapcsolatot – telefon, e-mail vagy Facebook üzenet. Szívesen válaszolok minden kérdésre.',
};

export const revalidate = 60;
export const dynamic = 'force-dynamic';

export default async function KapcsolatPage() {
  const [about, contact] = await Promise.all([
    getSiteContent('about'),
    getSiteContent('contact'),
  ]);
  const phoneHref = `tel:${contact.phone.replace(/[^+\d]/g, '')}`;

  return (
    <>
      <div className="ph">
        <h1>Kapcsolatfelvétel</h1>
        <p>Ha kérdésed van az utakkal kapcsolatban, szívesen fogadom üzeneteid.</p>
        <div className="ph-div" />
      </div>
      <div className="contact-wrap">
        <EditableRegion
          label="Elérhetőségek szerkesztése"
          modalTitle="Kapcsolati adatok"
          editor={<ContactEditor initial={contact} />}
        >
          <div className="contact-left">
          <div className="contact-photo-wrap">
            <Image
              src={about.portraitUrl}
              alt={about.portraitAlt}
              fill
              sizes="(max-width: 720px) 92vw, 470px"
            />
          </div>
          <h2>Írj nekem!</h2>
          <p>Ha kérdésed van az utakkal kapcsolatban, szívesen fogadom üzeneteid.</p>
          <div className="c-row">
            <span className="c-lbl">
              <Phone size={12} aria-hidden="true" />
              Telefon
            </span>
            <a className="c-val" href={phoneHref}>
              {contact.phone}
            </a>
          </div>
          <div className="c-row">
            <span className="c-lbl">
              <Mail size={12} aria-hidden="true" />
              E-mail
            </span>
            <a className="c-val" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
          </div>
          <div className="c-row">
            <span className="c-lbl">
              <Facebook size={12} aria-hidden="true" />
              Facebook
            </span>
            <a
              className="c-val"
              href={contact.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {contact.facebookLabel}
            </a>
          </div>
          {contact.instagramUrl && (
            <div className="c-row">
              <span className="c-lbl">
                <Instagram size={12} aria-hidden="true" />
                Instagram
              </span>
              <a
                className="c-val"
                href={contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {contact.instagramLabel || contact.instagramUrl}
              </a>
            </div>
          )}
          <a
            className="btn-outline-dark"
            style={{ marginTop: 18 }}
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
              style={{ marginTop: 10 }}
              href={contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={14} aria-hidden="true" />
              {contact.instagramLabel || 'Instagram'}
            </a>
          )}
          </div>
        </EditableRegion>
        <div>
          <ContactForm />
        </div>
      </div>
      <Footer />
    </>
  );
}
