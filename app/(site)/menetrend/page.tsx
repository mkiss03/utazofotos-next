import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/Footer';
import { EditableRegion } from '@/components/admin/EditableRegion';
import { ScheduleEditor } from '@/app/admin/(protected)/oldalak/ScheduleEditor';
import { ContactEditor } from '@/app/admin/(protected)/beallitasok/ContactEditor';
import { getSiteContent } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Éves menetrend',
  description: 'Tervezz előre – az UtazóFotós 2025–2026-os menetrendje.',
};

export const revalidate = 60;

export default async function MenetrendPage() {
  const [schedule, contact] = await Promise.all([
    getSiteContent('schedule'),
    getSiteContent('contact'),
  ]);

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
        <div className="sched-wrap">
          <div className="sched-img-wrap">
            <Image
              src={schedule.imageUrl}
              alt={schedule.imageAlt}
              fill
              sizes="(max-width: 720px) 92vw, 840px"
            />
          </div>
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
