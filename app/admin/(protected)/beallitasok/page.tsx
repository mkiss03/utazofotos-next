import { getSiteContent } from '@/lib/site-content';
import { ContactEditor } from './ContactEditor';
import { LegalEditor } from './LegalEditor';

export const dynamic = 'force-dynamic';

export default async function BeallitasokPage() {
  const [contact, legalImprint, legalPrivacy, legalTerms, legalCookies] = await Promise.all([
    getSiteContent('contact'),
    getSiteContent('legalImprint'),
    getSiteContent('legalPrivacy'),
    getSiteContent('legalTerms'),
    getSiteContent('legalCookies'),
  ]);
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Beállítások</h1>
        <p className="admin-page-sub">
          Globális kapcsolati információk és jogi oldalak szerkesztése.
        </p>
      </header>

      <section className="admin-section">
        <h2 className="admin-section-title">Kapcsolat</h2>
        <ContactEditor initial={contact} />
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">Impresszum</h2>
        <LegalEditor contentKey="legalImprint" initial={legalImprint} />
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">Adatvédelmi tájékoztató</h2>
        <LegalEditor contentKey="legalPrivacy" initial={legalPrivacy} />
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">Általános Szerződési Feltételek (ÁSZF)</h2>
        <LegalEditor contentKey="legalTerms" initial={legalTerms} />
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">Sütitájékoztató</h2>
        <LegalEditor contentKey="legalCookies" initial={legalCookies} />
      </section>
    </div>
  );
}
