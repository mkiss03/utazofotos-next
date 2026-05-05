import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, ImageIcon, ArrowRight, MapPin, Pencil } from 'lucide-react';
import {
  type Destination,
  getNextAnyDeparture,
} from '@/lib/destinations';
import { isAdminViewer } from '@/lib/admin-viewer';

export async function DestinationCard({ destination }: { destination: Destination }) {
  const next = getNextAnyDeparture(destination);
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const upcomingCount = destination.departures.filter(
    (d) => new Date(d.dateISO) >= today,
  ).length;
  const isAdmin = await isAdminViewer();

  return (
    <article className={`dest-row-card${isAdmin ? ' editable-region' : ''}`}>
      {isAdmin && (
        <Link
          href={`/admin/uticelok/${destination.slug}`}
          className="editable-pencil"
          title={`${destination.title} szerkesztése`}
          aria-label={`${destination.title} szerkesztése`}
        >
          <Pencil size={16} aria-hidden="true" />
          <span className="editable-pencil-label">Szerkesztés</span>
        </Link>
      )}
      <div className="dest-row-img">
        {destination.coverImage ? (
          <Image
            src={destination.coverImage}
            alt={destination.title}
            fill
            sizes="(max-width: 720px) 92vw, 280px"
          />
        ) : (
          <div className="dest-row-img-empty" aria-hidden="true">
            <ImageIcon strokeWidth={1} />
          </div>
        )}
        <span className="dest-row-region-badge">
          <MapPin size={14} aria-hidden="true" />
          {destination.region}
        </span>
      </div>

      <div className="dest-row-body">
        <h3 className="dest-row-title">{destination.title}</h3>
        <p className="dest-row-excerpt">{destination.excerpt}</p>

        {next ? (
          <div className="dest-row-meta">
            <CalendarDays size={18} aria-hidden="true" />
            <span>
              <span className="dest-row-meta-strong">Következő indulás: </span>
              {next.dateLabel}
              {upcomingCount > 1 && (
                <span className="dest-row-meta-count">
                  {' '}
                  · {upcomingCount} választható időpont
                </span>
              )}
            </span>
          </div>
        ) : (
          <div className="dest-row-no-departures">
            Jelenleg nincs meghirdetett időpont.
          </div>
        )}

        <div className="dest-row-actions">
          <Link
            href={`/uticelok/${destination.slug}`}
            className="btn-outline-dark"
            aria-label={`${destination.title} – részletek és időpontok`}
          >
            Részletek és időpontok
          </Link>
          {next && next.status !== 'full' && (
            <Link
              href={`/jelentkezes?utazas=${next.id}`}
              className="btn-accent"
              aria-label={`${destination.title} foglalása – ${next.dateLabel}`}
            >
              Foglalás
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

