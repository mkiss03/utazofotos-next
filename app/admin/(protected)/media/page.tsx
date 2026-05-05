import { listMedia } from './actions';
import { MediaLibrary } from './MediaLibrary';

export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const items = await listMedia();
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Médiatár</h1>
        <p className="admin-page-sub">
          Itt töltheted fel és kezelheted a képeket. A feltöltött képeket bárhol
          használhatod a weboldalon — borítóképként, tartalmi blokkokban,
          hero-képként.
        </p>
      </header>

      <MediaLibrary items={items} />
    </div>
  );
}
