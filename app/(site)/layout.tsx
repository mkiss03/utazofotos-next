import { TopBar } from '@/components/TopBar';
import { Nav } from '@/components/Nav';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <Nav />
      <main className="page-anim">{children}</main>
    </>
  );
}
