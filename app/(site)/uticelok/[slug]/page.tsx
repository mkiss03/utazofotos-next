import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, Mail, Camera } from 'lucide-react';
import { FBanner, Footer } from '@/components/Footer';
import { DepartureList } from '@/components/DepartureList';
import { AdminEditFab } from '@/components/AdminEditFab';
import {
  getDestinationBySlug,
  getAllDestinationSlugs,
} from '@/lib/data/destinations';
import type { DestinationBodyBlock } from '@/lib/destinations';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

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

  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const upcomingCount = dest.departures.filter(
    (d) => new Date(d.dateISO) >= today,
  ).length;

  return (
    <>
      {/* HERO */}
      <header className="td-hero">
        {dest.coverImage ? (
          <Image
            src={dest.coverImage}
            alt={dest.title}
            fill
            priority
            sizes="100vw"
            className="td-hero-img"
          />
        ) : (
          <div className="td-hero-img td-hero-empty" aria-hidden="true">
            <Camera size={48} />
          </div>
        )}
        <div className="td-hero-overlay" aria-hidden="true" />
        <div className="td-hero-inner">
          <Link href="/uticelok" className="td-hero-back">
            <ArrowLeft size={16} aria-hidden="true" />
            Vissza az úticélokhoz
          </Link>
          <span className="td-hero-region">
            <MapPin size={14} aria-hidden="true" />
            {dest.region}
          </span>
          <h1 className="td-hero-title">{dest.title}</h1>
          <p className="td-hero-lead">{dest.lead}</p>
        </div>
      </header>

      {/* TARTALOM + OLDALSÁV */}
      <div className="td-layout">
        <main className="td-main">
          <article className="td-body">
            <h2 className="td-body-h">Az utazás részletei</h2>
            {dest.body.map(renderBlock)}
          </article>

          <section className="td-cta">
            <h3>Bizonytalan vagy? Hívj telefonon!</h3>
            <p>Szívesen válaszolok minden kérdésedre, és segítek a foglalásban.</p>
            <a className="btn-accent btn-large" href="tel:+36302473323">
              <Phone size={18} aria-hidden="true" />
              +36 30 247 3323
            </a>
          </section>
        </main>

        <aside className="td-side">
          <div className="td-side-inner">
            <div className="td-side-card">
              <DepartureList destination={dest} />
            </div>

            <div className="td-side-card td-side-info">
              <h3 className="td-side-info-title">Jó tudni</h3>
              <ul className="td-side-info-list">
                <li>
                  <MapPin size={16} aria-hidden="true" />
                  <div>
                    <span className="td-side-info-label">Régió</span>
                    <span className="td-side-info-value">{dest.region}</span>
                  </div>
                </li>
                <li>
                  <Camera size={16} aria-hidden="true" />
                  <div>
                    <span className="td-side-info-label">Időpontok</span>
                    <span className="td-side-info-value">
                      {upcomingCount > 0
                        ? `${upcomingCount} elérhető`
                        : 'Hamarosan'}
                    </span>
                  </div>
                </li>
                <li>
                  <Phone size={16} aria-hidden="true" />
                  <div>
                    <span className="td-side-info-label">Telefon</span>
                    <a className="td-side-info-value" href="tel:+36302473323">
                      +36 30 247 3323
                    </a>
                  </div>
                </li>
                <li>
                  <Mail size={16} aria-hidden="true" />
                  <div>
                    <span className="td-side-info-label">E-mail</span>
                    <Link className="td-side-info-value" href="/kapcsolat">
                      Üzenetküldés
                    </Link>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <FBanner />
      <Footer withSocial={false} />
      {!isEmbed && (
        <AdminEditFab
          href={`/admin/uticelok/${dest.slug}`}
          label="Úticél szerkesztése"
        />
      )}
    </>
  );
}
