import { TopBar } from '@/components/TopBar';
import { Nav } from '@/components/Nav';
import { AdminBar } from '@/components/admin/AdminBar';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminBar />
      <TopBar />
      <Nav />
      <main className="page-anim">{children}</main>
    </>
  );
}
