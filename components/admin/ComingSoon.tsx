import { Wrench } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
  /** Hivatkozás a fejlesztési ütemtervre, pl. "2.1 – 2.4" */
  step?: string;
}

/**
 * Placeholder admin oldalakhoz, amik még nem készültek el.
 * Ahogy haladunk a fejlesztésben, ezek lépnek a helyükre.
 */
export function ComingSoon({ title, description, step }: ComingSoonProps) {
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>{title}</h1>
        <p className="admin-page-sub">{description}</p>
      </header>

      <div className="admin-coming-soon">
        <div className="admin-coming-soon-icon">
          <Wrench size={42} />
        </div>
        <div>
          <h2>Hamarosan elérhető</h2>
          <p>
            Ez a felület most épül. {step && <>Fejlesztési lépés: <strong>{step}</strong>.</>}
          </p>
          <p className="admin-coming-soon-tip">
            Tipp: amíg ez nincs kész, az áttekintő oldalon tudod nyomon követni az
            úticélok, indulások és foglalások számát.
          </p>
        </div>
      </div>
    </div>
  );
}
