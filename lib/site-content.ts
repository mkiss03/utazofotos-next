import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { siteContent } from '@/lib/db/schema';

/* ============================================================
   SITE CONTENT — kulcs alapú szöveg/kép tartalmak
   ============================================================
   A publikus oldalak ezeket a beállításokat olvassák, az admin
   ezekben a szerkesztőkben tudja módosítani őket. Ha egy kulcs
   még nincs DB-ben, a defaults alapján használjuk a szöveget.
   Így első telepítéskor is működik a webhely admin panel nélkül.
*/

export type HeroContent = {
  title: string;
  imageUrl: string;
  imageAlt: string;
};

export type AboutContent = {
  /** Az oldal alcíme a hős sávban (pl. "Üdvözöllek..."). */
  introLine: string;
  /** A bemutatkozó cím (h2). */
  title: string;
  /** Bekezdések; mindegyik egy önálló <p>-ben jelenik meg. */
  paragraphs: string[];
  /** Záró sor a végén (kiemelt aláírás). */
  closing: string;
  /** Profilkép. */
  portraitUrl: string;
  portraitAlt: string;
};

export type ScheduleContent = {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
};

export type ContactContent = {
  phone: string;
  email: string;
  facebookUrl: string;
  facebookLabel: string;
};

export type SiteContentMap = {
  hero: HeroContent;
  about: AboutContent;
  schedule: ScheduleContent;
  contact: ContactContent;
};

export const DEFAULTS: SiteContentMap = {
  hero: {
    title: 'Stílusos utak megfizethető áron!',
    imageUrl: '/images/hero.jpg',
    imageAlt: 'UtazóFotós hero',
  },
  about: {
    introLine: 'Üdvözöllek! Szeretnék Neked bemutatkozni',
    title: 'Rólam',
    paragraphs: [
      'Tuza-Göncz Zsuzsanna vagyok! Kiscsoportos túrákat szervezek elsősorban Olaszországba, azon belül is több régióba, ahol a lehető legtöbb érzékszervünket tudjuk kényeztetni. A kirándulások célja: kulturális programok helyi csoportkísérővel, gasztronómiai élmények és a bónusz – hogy készítek pár ütős képet Rólad, persze csak ha szeretnéd.',
      'Igyekszem minden túrán kint élő magyarral is találkozni, aki mesélni tud a helyi szokásokról, a helyi ételekről, az olasz életérzésről.',
      'Igyekszem minden túrára különleges gasztronómiai élményeket szervezni: sajt- és olivaolaj kóstoló, bolognai ragu és házi tészta készítés, olasz sonka kóstoló – és még sok minden más, amitől igazán színes lehet egy utazási élmény.',
      'Nem gondolom, hogy én vagyok a legprofibb a piacon – jó pap is holtig tanul – csak azt tudom, hogy kellő alázattal, maximális odaadással és a legnagyobb szeretettel azon leszek, hogy egy felejthetetlen utazással és megannyi emlékkel térj majd haza, ha úgy döntesz velem jössz.',
      'Köszönöm, hogy itt vagy, és ha van olyan ismerősöd, akit tudod, hogy régóta szeretne már Olaszországba menni, de nem tudja, vagy nem akarja az idejét szervezéssel tölteni – meséld el neki, hogy itt esély nyílik, hogy megtalálja a számítását.',
    ],
    closing: 'Köszönöm, hogy elolvastad. Legyen csodás napod!',
    portraitUrl: '/images/zsuzsanna.jpeg',
    portraitAlt: 'Tuza-Göncz Zsuzsanna',
  },
  schedule: {
    title: 'Éves menetrend',
    subtitle: 'Tervezz előre – 2025–2026',
    imageUrl: '/images/menetrend.png',
    imageAlt: 'Éves menetrend',
  },
  contact: {
    phone: '+36 30 247 3323',
    email: 'utazoelmenyfotos@gmail.com',
    facebookUrl:
      'https://www.facebook.com/groups/utazofotos.napolyromatoszkana',
    facebookLabel: 'Utazó fotós: Nápoly–Róma–Toszkána',
  },
};

/**
 * Kiolvas egy site_content bejegyzést a DB-ből; ha még nincs, a defaults szerint
 * adja vissza. Sose dob hibát ismert kulcs esetén — kezdeti deploy is működik.
 */
export async function getSiteContent<K extends keyof SiteContentMap>(
  key: K,
): Promise<SiteContentMap[K]> {
  const [row] = await db
    .select({ value: siteContent.value })
    .from(siteContent)
    .where(eq(siteContent.key, key))
    .limit(1);

  if (!row) return DEFAULTS[key];

  // Az adminban érvényesítjük; itt biztonságosan összemossuk a defaults-szal,
  // hogy hiányzó mezők esetén se essen szét a publikus oldal.
  return {
    ...DEFAULTS[key],
    ...(row.value as Partial<SiteContentMap[K]>),
  } as SiteContentMap[K];
}

/**
 * Egyszerre több kulcsot kérünk le. (Hasznos publikus oldalakon.)
 */
export async function getSiteContentMany<K extends keyof SiteContentMap>(
  keys: K[],
): Promise<{ [P in K]: SiteContentMap[P] }> {
  const out = {} as { [P in K]: SiteContentMap[P] };
  await Promise.all(
    keys.map(async (k) => {
      out[k] = await getSiteContent(k);
    }),
  );
  return out;
}

export async function setSiteContent<K extends keyof SiteContentMap>(
  key: K,
  value: SiteContentMap[K],
  updatedById: string | null,
): Promise<void> {
  await db
    .insert(siteContent)
    .values({
      key,
      value: value as unknown as Record<string, unknown>,
      updatedById: updatedById ?? null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteContent.key,
      set: {
        value: value as unknown as Record<string, unknown>,
        updatedById: updatedById ?? null,
        updatedAt: new Date(),
      },
    });
}
