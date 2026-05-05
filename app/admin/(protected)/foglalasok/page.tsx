import { listBookings } from './actions';
import { BookingsList } from './BookingsList';

export const dynamic = 'force-dynamic';

export default async function FoglalasokPage() {
  const items = await listBookings();
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Foglalások</h1>
        <p className="admin-page-sub">
          Itt látod a beérkezett jelentkezéseket. Az egyes foglalásokra kattintva
          tudod kezelni a státuszt és belső megjegyzéseket írni.
        </p>
      </header>

      <BookingsList items={items.map((it) => ({
        ...it,
        createdAt: it.createdAt.toISOString(),
      }))} />
    </div>
  );
}
