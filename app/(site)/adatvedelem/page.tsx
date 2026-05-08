import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { getSiteContent } from '@/lib/site-content';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Adatvédelmi tájékoztató',
  robots: { index: false },
};

export default async function AdatvedelemPage() {
  const page = await getSiteContent('legalPrivacy');
  return (
    <>
      <main className="legal-page">
        <div className="legal-inner">
          <div
            className="legal-body"
            dangerouslySetInnerHTML={{ __html: page.html }}
          />
          <p className="legal-updated">Utolsó frissítés: {page.lastUpdated}</p>
        </div>
      </main>
      <Footer withSocial={false} />
    </>
  );
}
