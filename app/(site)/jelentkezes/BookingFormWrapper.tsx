'use client';

import { useSearchParams } from 'next/navigation';
import { BookingForm } from '@/components/BookingForm';
import type { Destination } from '@/lib/destinations';

export function BookingFormWrapper({
  allDestinations,
}: {
  allDestinations: Destination[];
}) {
  const params = useSearchParams();
  // Új paraméter: ?utazas=<departureId>; régi: ?ut=<slug> → fallback
  const departureId = params.get('utazas') ?? undefined;
  const slug = params.get('ut') ?? undefined;
  return (
    <BookingForm
      preselectedDepartureId={departureId}
      preselectedSlug={slug}
      allDestinations={allDestinations}
    />
  );
}

