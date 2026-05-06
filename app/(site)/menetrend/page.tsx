import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { EditableRegion } from '@/components/admin/EditableRegion';
import { ScheduleEditor } from '@/app/admin/(protected)/oldalak/ScheduleEditor';
import { ContactEditor } from '@/app/admin/(protected)/beallitasok/ContactEditor';
import {
  ScheduleCalendar,
  type ScheduleEntry,
} from '@/components/ScheduleCalendar';
import { getSiteContent } from '@/lib/site-content';
import { getAllDestinations } from '@/lib/data/destinations';

export const metadata: Metadata = {
  title: 'Éves menetrend',
  description: 'Tervezz előre – az UtazóFotós menetrendje, interaktív naptárral.',
};

export const revalidate = 60;
export const dynamic = 'force-dynamic';

export default async function MenetrendPage() {
  const [schedule, contact, destinations] = await Promise.all([
    getSiteContent('schedule'),
    getSiteContent('contact'),
    getAllDestinations(),
  ]);

  const todayISO = new Date().toISOString().slice(0, 10);
  const entries: ScheduleEntry[] = destinations.flatMap((d) =>
    d.departures.map((dep) => ({
      id: dep.id,
      destinationSlug: d.slug,
      destinationTitle: d.title,
      region: d.region,
      dateISO: dep.dateISO,
      dateLabel: dep.dateLabel,
      monthShort: dep.monthShort,
      day: dep.day,
      durationDays: dep.durationDays,
      priceFrom: dep.priceFrom,
      status: dep.status,
      note: dep.note,
      isPast: dep.dateISO < todayISO,
    })),
  );

  const phoneHref = `tel:${contact.phone.replace(/[^+\d]/g, '')}`;

  return (
    <>
      <EditableRegion
        label="Menetrend szerkesztése"
        modalTitle="Éves menetrend tartalom"
        editor={<ScheduleEditor initial={schedule} />}
      >
        <div className="ph">
          <h1>{schedule.title}</h1>
          <p>{schedule.subtitle}</p>
          <div className="ph-div" />
        </div>

        <ScheduleCalendar entries={entries} />

        <div className="sched-wrap">
          <EditableRegion
            label="Elérhetőségek szerkesztése"
            modalTitle="Kapcsolati adatok"
            editor={<ContactEditor initial={contact} />}
          >
            <div className="sched-box">
              <p>Szabad helyekről érdeklődj telefonon:</p>
              <a href={phoneHref} className="sched-phone">
                {contact.phone}
              </a>
              <div className="sched-email">
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </div>
              <div style={{ marginTop: 22 }}>
                <Link className="btn-dark" href="/jelentkezes">
                  Online foglalás
                </Link>
              </div>
            </div>
          </EditableRegion>
        </div>
      </EditableRegion>
      <Footer />
    </>
  );
}
