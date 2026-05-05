'use client';

import { useEffect, useState, useTransition, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Save, Loader2, Eye, EyeOff, ImageOff, Wand2, Trash2 } from 'lucide-react';
import { updateDestinationBasic, type UpdateBasicState } from './actions';
import { slugify } from '@/lib/slug';
import { MediaPicker } from '@/components/admin/MediaPicker';

type DestProps = {
  id: string;
  slug: string;
  title: string;
  region: string;
  excerpt: string;
  lead: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  sortOrder: number;
  published: boolean;
};

const initialState: UpdateBasicState = { ok: false };

export function EditBasicForm({ destination }: { destination: DestProps }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(updateDestinationBasic, initialState);

  // Kontrollált mezők — hogy az élő slug-előállítás és a coverkép-előnézet menjen.
  const [title, setTitle] = useState(destination.title);
  const [slug, setSlug] = useState(destination.slug);
  const [region, setRegion] = useState(destination.region);
  const [excerpt, setExcerpt] = useState(destination.excerpt);
  const [lead, setLead] = useState(destination.lead);
  const [coverImageUrl, setCoverImageUrl] = useState(destination.coverImageUrl ?? '');
  const [coverImageAlt, setCoverImageAlt] = useState(destination.coverImageAlt ?? '');
  const [sortOrder, setSortOrder] = useState<number>(destination.sortOrder);
  const [published, setPublished] = useState<boolean>(destination.published);

  // Sikeres mentés után — ha változott a slug, navigáljunk az új URL-re.
  useEffect(() => {
    if (state.ok && state.newSlug && state.newSlug !== destination.slug) {
      router.replace(`/admin/uticelok/${state.newSlug}`);
    }
  }, [state, destination.slug, router]);

  const fe = state.fieldErrors ?? {};

  function handleSubmit(formData: FormData) {
    startTransition(() => {
      formAction(formData);
    });
  }

  function autoSlugFromTitle() {
    setSlug(slugify(title));
  }

  return (
    <form action={handleSubmit} className="admin-form">
      <input type="hidden" name="id" value={destination.id} />

      <div className="admin-form-grid">
        {/* Bal oszlop: szöveges adatok */}
        <div className="admin-form-col">
          <div className="admin-field">
            <label htmlFor="f-title">Cím</label>
            <input
              id="f-title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              aria-invalid={Boolean(fe.title)}
            />
            {fe.title && <p className="admin-field-error">{fe.title}</p>}
            <p className="admin-field-hint">
              Ez jelenik meg az úticél fejlécében és a listában.
            </p>
          </div>

          <div className="admin-field">
            <label htmlFor="f-slug">Webcím (slug)</label>
            <div className="admin-field-row">
              <span className="admin-field-prefix">/uticelok/</span>
              <input
                id="f-slug"
                name="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                maxLength={120}
                required
                aria-invalid={Boolean(fe.slug)}
              />
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={autoSlugFromTitle}
                title="Generálás a címből"
              >
                <Wand2 size={16} aria-hidden="true" />
                <span>Cím alapján</span>
              </button>
            </div>
            {fe.slug && <p className="admin-field-error">{fe.slug}</p>}
            <p className="admin-field-hint">
              Csak kisbetű, szám és kötőjel. Pl.: <code>velence-tava</code>.
            </p>
          </div>

          <div className="admin-field">
            <label htmlFor="f-region">Régió</label>
            <input
              id="f-region"
              name="region"
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              maxLength={80}
              required
              aria-invalid={Boolean(fe.region)}
            />
            {fe.region && <p className="admin-field-error">{fe.region}</p>}
            <p className="admin-field-hint">
              Pl. „Salzkammergut", „Tirol" – a kártyákon és a részletes oldalon
              jelenik meg.
            </p>
          </div>

          <div className="admin-field">
            <label htmlFor="f-excerpt">Rövid leírás (kártyán)</label>
            <textarea
              id="f-excerpt"
              name="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              maxLength={500}
              rows={3}
              aria-invalid={Boolean(fe.excerpt)}
            />
            <div className="admin-field-counter">
              {excerpt.length} / 500 karakter
            </div>
            {fe.excerpt && <p className="admin-field-error">{fe.excerpt}</p>}
          </div>

          <div className="admin-field">
            <label htmlFor="f-lead">Bevezető (a részletes oldalon)</label>
            <textarea
              id="f-lead"
              name="lead"
              value={lead}
              onChange={(e) => setLead(e.target.value)}
              maxLength={2000}
              rows={5}
              aria-invalid={Boolean(fe.lead)}
            />
            <div className="admin-field-counter">
              {lead.length} / 2000 karakter
            </div>
            {fe.lead && <p className="admin-field-error">{fe.lead}</p>}
          </div>
        </div>

        {/* Jobb oszlop: kép, sorrend, publikálás */}
        <div className="admin-form-col">
          <div className="admin-field">
            <label>Borítókép</label>
            <div className="admin-cover-preview">
              {coverImageUrl ? (
                <Image
                  src={coverImageUrl}
                  alt={coverImageAlt || 'Borítókép előnézet'}
                  fill
                  sizes="320px"
                  style={{ objectFit: 'cover' }}
                  unoptimized
                />
              ) : (
                <div className="admin-cover-empty">
                  <ImageOff size={36} aria-hidden="true" />
                  <span>Nincs borítókép</span>
                </div>
              )}
            </div>
            <input
              id="f-cover"
              name="coverImageUrl"
              type="text"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="/images/peldakep.jpg vagy https://…"
              maxLength={500}
              aria-invalid={Boolean(fe.coverImageUrl)}
            />
            <div className="admin-field-row" style={{ marginTop: 6 }}>
              <MediaPicker
                onPick={(sel) => {
                  setCoverImageUrl(sel.url);
                  if (!coverImageAlt && sel.alt) setCoverImageAlt(sel.alt);
                }}
              />
              {coverImageUrl && (
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setCoverImageUrl('')}
                  title="Kép eltávolítása"
                >
                  <Trash2 size={14} aria-hidden="true" />
                  <span>Eltávolítás</span>
                </button>
              )}
            </div>
            {fe.coverImageUrl && (
              <p className="admin-field-error">{fe.coverImageUrl}</p>
            )}
            <p className="admin-field-hint">
              Válassz a médiatárból, vagy írj be egy URL-t közvetlenül.
            </p>
          </div>

          <div className="admin-field">
            <label htmlFor="f-cover-alt">Borítókép alt-szöveg</label>
            <input
              id="f-cover-alt"
              name="coverImageAlt"
              type="text"
              value={coverImageAlt}
              onChange={(e) => setCoverImageAlt(e.target.value)}
              maxLength={200}
              placeholder="Pl. Hallstatti tó hajnalban"
            />
            <p className="admin-field-hint">
              Akadálymentesség és SEO miatt: röviden írd le, mi látszik a képen.
            </p>
          </div>

          <div className="admin-field">
            <label htmlFor="f-sort">Sorrend</label>
            <input
              id="f-sort"
              name="sortOrder"
              type="number"
              min={0}
              max={100000}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              aria-invalid={Boolean(fe.sortOrder)}
            />
            <p className="admin-field-hint">
              Alacsonyabb szám = előbb. A listában nyilakkal is állíthatod.
            </p>
          </div>

          <div className="admin-field">
            <label className="admin-toggle">
              <input
                type="checkbox"
                name="published"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              <span className="admin-toggle-label">
                {published ? (
                  <>
                    <Eye size={18} aria-hidden="true" />
                    Publikálva — látszik a látogatóknak
                  </>
                ) : (
                  <>
                    <EyeOff size={18} aria-hidden="true" />
                    Nem publikus — csak admin felületen látszik
                  </>
                )}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Sticky mentő sáv */}
      <div className="admin-form-bar">
        {state.error && !state.ok && (
          <div className="admin-form-status admin-form-status-error">
            {state.error}
          </div>
        )}
        {state.ok && (
          <div className="admin-form-status admin-form-status-ok">
            Mentve. A változás 1 percen belül megjelenik a publikus oldalon.
          </div>
        )}
        <button
          type="submit"
          className="admin-btn admin-btn-primary admin-btn-lg"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 size={18} className="admin-spin" aria-hidden="true" />
              Mentés…
            </>
          ) : (
            <>
              <Save size={18} aria-hidden="true" />
              Mentés
            </>
          )}
        </button>
      </div>
    </form>
  );
}
