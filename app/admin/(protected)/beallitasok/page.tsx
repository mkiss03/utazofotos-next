import { getSiteContent } from '@/lib/site-content';
import { ContactEditor } from './ContactEditor';

export const dynamic = 'force-dynamic';

export default async function BeallitasokPage() {
  const contact = await getSiteContent('contact');
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Beállítások</h1>
        <p className="admin-page-sub">
          Globális kapcsolati információk – ezek jelennek meg a Kapcsolat
          oldalon, a lábrészben és más helyeken.
        </p>
      </header>

      <section className="admin-section">
        <h2 className="admin-section-title">Kapcsolat</h2>
        <ContactEditor initial={contact} />
      </section>
    </div>
  );
}
