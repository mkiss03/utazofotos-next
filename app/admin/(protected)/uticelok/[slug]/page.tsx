import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getDestinationBySlugForAdmin } from './actions';
import { listDeparturesForDestination } from './departure-actions';
import { EditBasicForm } from './EditBasicForm';
import { BodyBlocksEditor } from './BodyBlocksEditor';
import { DeparturesEditor } from './DeparturesEditor';
import { DeleteDestinationButton } from './DeleteDestinationButton';
import { LivePreviewPanel } from '@/components/admin/LivePreviewPanel';
import type { DestinationBodyBlock } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export default async function EditDestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dest = await getDestinationBySlugForAdmin(slug);
  if (!dest) notFound();

  const deps = await listDeparturesForDestination(dest.id);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <Link href="/admin/uticelok" className="admin-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Vissza az úticélokhoz
        </Link>
        <h1>{dest.title}</h1>
        <p className="admin-page-sub">
          Itt szerkesztheted az úticél alapadatait. Mentés után a publikus
          oldal 1 percen belül frissül.
        </p>
      </header>

      <LivePreviewPanel slug={dest.slug} />

      <section className="admin-section">
        <h2 className="admin-section-title">Alapadatok</h2>
        <EditBasicForm
          destination={{
            id: dest.id,
            slug: dest.slug,
            title: dest.title,
            region: dest.region,
            excerpt: dest.excerpt,
            lead: dest.lead,
            coverImageUrl: dest.coverImageUrl,
            coverImageAlt: dest.coverImageAlt,
            sortOrder: dest.sortOrder,
            published: dest.published,
          }}
        />
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">Tartalmi blokkok</h2>
        <p className="admin-section-hint">
          A részletes leírás építőkövei: alcímek, bekezdések, listák, képek.
          Tetszőleges sorrendben.
        </p>
        <BodyBlocksEditor
          destinationId={dest.id}
          slug={dest.slug}
          initialBody={(dest.body ?? []) as DestinationBodyBlock[]}
        />
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">Indulások</h2>
        <DeparturesEditor
          destinationId={dest.id}
          destinationSlug={dest.slug}
          initial={deps.map((d) => ({
            id: d.id,
            destinationId: d.destinationId,
            dateISO: d.dateISO,
            dateLabel: d.dateLabel,
            monthShort: d.monthShort,
            day: d.day,
            durationDays: d.durationDays,
            priceFrom: d.priceFrom,
            status: d.status,
            note: d.note,
          }))}
        />
      </section>

      <section className="admin-section admin-section-danger">
        <h2 className="admin-section-title">Veszélyes zóna</h2>
        <p className="admin-section-hint">
          Itt véglegesen törölheted az úticélt. A művelet nem visszafordítható.
        </p>
        <div style={{ marginTop: 14 }}>
          <DeleteDestinationButton
            destinationId={dest.id}
            destinationTitle={dest.title}
          />
        </div>
      </section>
    </div>
  );
}
