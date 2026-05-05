import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { NewDestinationForm } from './NewDestinationForm';

export default function NewDestinationPage() {
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <Link href="/admin/uticelok" className="admin-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Vissza az úticélokhoz
        </Link>
        <h1>Új úticél</h1>
        <p className="admin-page-sub">
          Add meg a címet és a régiót — a részleteket (leírás, képek, indulások)
          a létrehozás után tudod kitölteni. Az új úticél alapból
          <strong> nem publikus</strong>, hogy nyugodtan szerkeszthesd.
        </p>
      </header>

      <section className="admin-section">
        <NewDestinationForm />
      </section>
    </div>
  );
}
