import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Phone } from 'lucide-react';
import { FBanner, Footer } from '@/components/Footer';
import { DepartureList } from '@/components/DepartureList';
import { AdminEditFab } from '@/components/AdminEditFab';
import {
  getDestinationBySlug,
  getAllDestinationSlugs,
} from '@/lib/data/destinations';
import type { DestinationBodyBlock } from '@/lib/destinations';

export const revalidate = 60;

export async function generateStaticParams() {
  // Build-időben a DB nem feltétlenül érhető el (pl. ha nincs DATABASE_URL).
  // Ilyenkor üres listát adunk vissza – az oldalak ISR-rel készülnek el
  // a futás során, az első kérésre.
  try {
    const slugs = await getAllDestinationSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (err) {
    console.warn(
      '[generateStaticParams] DB nem elérhető build-időben, ISR-re hagyatkozunk:',
      err,
    );
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  if (!dest) return { title: 'Úticél nem található' };
  return {
    title: dest.title,
    description: dest.lead,
    openGraph: {
      title: dest.title,
      description: dest.lead,
      images: dest.coverImage ? [{ url: dest.coverImage }] : undefined,
    },
  };
}

function renderBlock(block: DestinationBodyBlock, idx: number) {
  switch (block.type) {
    case 'h2':
      return <h2 key={idx}>{block.text}</h2>;
    case 'p':
      return <p key={idx}>{block.text}</p>;
    case 'ul':
      return (
        <ul key={idx}>
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case 'image':
      return (
        <div key={idx} className="td-img-wrap">
          <Image
            src={block.src}
            alt={block.alt}
            fill
            sizes="(max-width: 720px) 92vw, 700px"
          />
        </div>
      );
  }
}

export default async function DestinationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ embed?: string }>;
}) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const isEmbed = sp.embed === '1';
  const dest = await getDestinationBySlug(slug);
  if (!dest) notFound();

  return (
    <>
      <div className="td-wrap">
        <Link href="/uticelok" className="back-btn">
          <ArrowLeft size={16} aria-hidden="true" />
          Vissza az úticélokhoz
        </Link>
        <div className="td-date">
          <MapPin
            size={14}
            aria-hidden="true"
            style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }}
          />
          {dest.region}
        </div>
        <h1 className="td-h1">{dest.title}</h1>
        <p className="td-lead">{dest.lead}</p>

        {/* Indulási időpontok – fókuszban, közvetlenül a leírás után */}
        <DepartureList destination={dest} />

        {/* Részletes program */}
        <div className="td-body" style={{ marginTop: 36 }}>
          <h2 style={{ borderTop: '2px solid var(--accent)', paddingTop: 28, marginTop: 0 }}>
            Az utazás részletei
          </h2>
          {dest.body.map(renderBlock)}
        </div>

        <div className="td-cta">
          <h3>Bizonytalan vagy? Hívj telefonon!</h3>
          <p>Szívesen válaszolok minden kérdésedre, és segítek a foglalásban.</p>
          <a className="btn-accent btn-large" href="tel:+36302473323">
            <Phone size={18} aria-hidden="true" />
            +36 30 247 3323
          </a>
        </div>
      </div>
      <FBanner />
      <Footer withFb={false} />
      {!isEmbed && (
        <AdminEditFab
          href={`/admin/uticelok/${dest.slug}`}
          label="Úticél szerkesztése"
        />
      )}
    </>
  );
}
