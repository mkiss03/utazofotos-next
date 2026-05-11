import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DestinationsGrid, type GridDestination } from '@/components/DestinationsGrid';
import { FBanner, Footer } from '@/components/Footer';
import { EditableRegion } from '@/components/admin/EditableRegion';
import { EditableLinkRegion } from '@/components/admin/EditableLinkRegion';
import { HeroEditor } from '@/app/admin/(protected)/oldalak/HeroEditor';
import { TestimonialsEditor } from '@/app/admin/(protected)/oldalak/TestimonialsEditor';
import { TestimonialsGallery } from '@/components/TestimonialsGallery';
import { getAllDestinations } from '@/lib/data/destinations';
import { getNextAnyDeparture } from '@/lib/destinations';
import { getSiteContentMany } from '@/lib/site-content';
import { isAdminViewer } from '@/lib/admin-viewer';

// ISR: 60 másodpercenként újragenerálódik, ha az admin szerkesztett.
export const revalidate = 60;
// Build-időben ne pre-rendereljük; első kérésre fut le, és onnantól ISR.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [all, content, isAdmin] = await Promise.all([
    getAllDestinations(),
    getSiteContentMany(['hero', 'testimonials']),
    isAdminViewer(),
  ]);
  const { hero, testimonials } = content;
  const upcoming = all.slice(0, 6);
  const today = new Date(new Date().setHours(0, 0, 0, 0));

  const gridItems: GridDestination[] = upcoming.map((d) => {
    const next = getNextAnyDeparture(d);
    const upcomingCount = d.departures.filter(
      (dep) => new Date(dep.dateISO) >= today,
    ).length;
    return {
      slug: d.slug,
      title: d.title,
      region: d.region,
      excerpt: d.excerpt,
      coverImage: d.coverImage,
      nextDateLabel: next?.dateLabel ?? null,
      nextDateISO: next?.dateISO ?? null,
      nextStatus: next?.status ?? null,
      nextId: next?.id ?? null,
      upcomingCount,
    };
  });

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

      <EditableLinkRegion
        label="Úticélok kezelése"
        href="/admin/uticelok"
      >
        <div className="section-head">
          <h2>Közelgő úticélok</h2>
          <p style={{ marginTop: 8, color: 'var(--mid)', fontSize: '1.05rem' }}>
            Válassz úticélt, és nézd meg a meghirdetett indulási időpontokat.
          </p>
        </div>

        <div className="dest-grid-wrap" style={{ paddingTop: 8 }}>
          <DestinationsGrid items={gridItems} isAdmin={isAdmin} showToolbar={false} />
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link href="/uticelok" className="btn-outline-dark btn-large">
              Az összes úticél megtekintése
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </EditableLinkRegion>

      <EditableRegion
        label="Vélemények és galéria szerkesztése"
        modalTitle="Kezdőlap — Vélemények és galéria"
        editor={<TestimonialsEditor initial={testimonials} />}
      >
        <TestimonialsGallery data={testimonials} />
      </EditableRegion>

      <EditableLinkRegion
        label="Kapcsolat / Beállítások"
        href="/admin/beallitasok"
      >
        <FBanner />
        <Footer />
      </EditableLinkRegion>
    </>
  );
}
