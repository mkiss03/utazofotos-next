import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DestinationCard } from '@/components/DestinationCard';
import { FBanner, Footer } from '@/components/Footer';
import { EditableRegion } from '@/components/admin/EditableRegion';
import { HeroEditor } from '@/app/admin/(protected)/oldalak/HeroEditor';
import { getAllDestinations } from '@/lib/data/destinations';
import { sortByNextDeparture } from '@/lib/destinations';
import { getSiteContent } from '@/lib/site-content';

// ISR: 60 másodpercenként újragenerálódik, ha az admin szerkesztett.
export const revalidate = 60;
// Build-időben ne pre-rendereljük; első kérésre fut le, és onnantól ISR.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [all, hero] = await Promise.all([
    getAllDestinations(),
    getSiteContent('hero'),
  ]);
  const upcoming = sortByNextDeparture(all).slice(0, 4);

  return (
    <>
      <EditableRegion
        label="Hero szakasz szerkesztése"
        modalTitle="Kezdőoldal — Hero szakasz"
        editor={<HeroEditor initial={hero} />}
      >
        <div className="hero">
          <div className="hero-img-wrap">
            <Image
              src={hero.imageUrl}
              alt={hero.imageAlt}
              fill
              sizes="100vw"
              priority
            />
          </div>
          <div className="hero-overlay">
            <div className="hero-line" />
            <h1 className="hero-title">{hero.title}</h1>
            <div className="hero-line b" />
          </div>
        </div>
      </EditableRegion>

      <div className="section-head">
        <h2>Közelgő úticélok</h2>
        <p style={{ marginTop: 8, color: 'var(--mid)', fontSize: '1.05rem' }}>
          Válassz úticélt, és nézd meg a meghirdetett indulási időpontokat.
        </p>
      </div>

      <div className="dest-list-wrap" style={{ paddingTop: 8 }}>
        <div className="dest-list">
          {upcoming.map((d) => (
            <DestinationCard key={d.slug} destination={d} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link href="/uticelok" className="btn-outline-dark btn-large">
            Az összes úticél megtekintése
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <FBanner />
      <Footer />
    </>
  );
}
