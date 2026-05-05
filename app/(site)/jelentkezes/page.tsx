import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Footer } from '@/components/Footer';
import { BookingFormWrapper } from './BookingFormWrapper';
import { getAllDestinations } from '@/lib/data/destinations';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Jelentkezés',
  description: 'Foglald le a helyed az utazásra – egyszerű online jelentkezés.',
};

export default async function JelentkezesPage() {
  const allDestinations = await getAllDestinations();
  return (
    <>
      <div className="ph">
        <h1>Jelentkezés</h1>
        <p>Foglald le a helyed időben!</p>
        <div className="ph-div" />
      </div>
      <div className="form-wrap">
        <div className="form-intro">
          <h2>
            Utazzunk együtt és hagyjuk, hogy átjárja minden porcikánkat a <em>Dolce Vita</em>-érzés!
          </h2>
          <p>Kész vagy velem átélni életed egyik legjobb utazását?</p>
        </div>
        <div className="form-steps">
          <div className="form-step">
            <div className="step-n">1</div>
            <div className="step-t">Töltsd ki az űrlapot</div>
          </div>
          <div className="form-step">
            <div className="step-n">2</div>
            <div className="step-t">Fizess előleget</div>
          </div>
          <div className="form-step">
            <div className="step-n">3</div>
            <div className="step-t">E-mailes visszaigazolás</div>
          </div>
          <div className="form-step">
            <div className="step-n">4</div>
            <div className="step-t">Indulj velünk!</div>
          </div>
        </div>
        <Suspense fallback={null}>
          <BookingFormWrapper allDestinations={allDestinations} />
        </Suspense>
      </div>
      <Footer withFb={false} />
    </>
  );
}
