import { listContactMessages } from './actions';
import { MessagesList } from './MessagesList';

export const dynamic = 'force-dynamic';

export default async function UzenetekPage() {
  const items = await listContactMessages();
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Üzenetek</h1>
        <p className="admin-page-sub">
          A Kapcsolat oldalon érkezett üzenetek. Jelöld megválaszoltnak vagy
          archiváld őket, ha már lekezelted.
        </p>
      </header>

      <MessagesList
        items={items.map((it) => ({
          ...it,
          createdAt: it.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
