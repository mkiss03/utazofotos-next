import { getSiteContent } from '@/lib/site-content';
import { HeroEditor } from './HeroEditor';
import { AboutEditor } from './AboutEditor';
import { ScheduleEditor } from './ScheduleEditor';

export const dynamic = 'force-dynamic';

export default async function OldalakPage() {
  const [hero, about, schedule] = await Promise.all([
    getSiteContent('hero'),
    getSiteContent('about'),
    getSiteContent('schedule'),
  ]);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Oldalak tartalma</h1>
        <p className="admin-page-sub">
          Itt szerkesztheted a kezdőlap, a Rólam és a Menetrend oldal szövegét és
          képeit. A változások mentés után azonnal megjelennek a webhelyen.
        </p>
      </header>

      <section className="admin-section">
        <h2 className="admin-section-title">Kezdőlap – hero szakasz</h2>
        <HeroEditor initial={hero} />
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">Rólam oldal</h2>
        <AboutEditor initial={about} />
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">Éves menetrend oldal</h2>
        <ScheduleEditor initial={schedule} />
      </section>
    </div>
  );
}
