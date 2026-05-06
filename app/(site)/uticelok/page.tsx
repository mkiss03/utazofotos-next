import type { Metadata } from 'next';
import { FBanner, Footer } from '@/components/Footer';
import { DestinationsGrid, type GridDestination } from '@/components/DestinationsGrid';
import { AdminEditFab } from '@/components/AdminEditFab';
import { getAllDestinations } from '@/lib/data/destinations';
import { sortByNextDeparture, getNextAnyDeparture } from '@/lib/destinations';
import { isAdminViewer } from '@/lib/admin-viewer';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Úticélok',
  description:
    'Az összes meghirdetett kiscsoportos utam. Válassz úticélt, és nézd meg a meghirdetett indulási időpontokat.',
};

export default async function UticelokPage() {
  // Egységes lista, a következő indulás dátuma szerint sorrendezve.
  const all = await getAllDestinations();
  const sorted = sortByNextDeparture(all);
  const isAdmin = await isAdminViewer();

  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const items: GridDestination[] = sorted.map((d) => {
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
      <div className="ph">
        <h1>Úticélok</h1>
        <p>
          Válassz úticélt – minden helyhez több indulási időpontot is meghirdetek.
          Foglalj online, vagy hívj telefonon, ha kérdésed van.
        </p>
        <div className="ph-div" />
      </div>

      <div className="dest-grid-wrap">
        <DestinationsGrid items={items} isAdmin={isAdmin} />
      </div>

      <FBanner />
      <Footer />
      <AdminEditFab href="/admin/uticelok" label="Úticélok kezelése" />
    </>
  );
}
