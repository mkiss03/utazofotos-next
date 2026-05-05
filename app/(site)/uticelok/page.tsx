import type { Metadata } from 'next';
import { FBanner, Footer } from '@/components/Footer';
import { DestinationCard } from '@/components/DestinationCard';
import { AdminEditFab } from '@/components/AdminEditFab';
import { getAllDestinations } from '@/lib/data/destinations';
import { sortByNextDeparture } from '@/lib/destinations';

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

      <div className="dest-list-wrap">
        <div className="dest-list">
          {sorted.map((d) => (
            <DestinationCard key={d.slug} destination={d} />
          ))}
        </div>
      </div>

      <FBanner />
      <Footer />
      <AdminEditFab href="/admin/uticelok" label="Úticélok kezelése" />
    </>
  );
}
