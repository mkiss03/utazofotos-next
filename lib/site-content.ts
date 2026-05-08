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
};

export type TestimonialEntry = {
  id: string;
  name: string;
  trip: string;
  quote: string;
  photoUrl: string;
  photoAlt: string;
  rating?: number;
};

export type TestimonialsContent = {
  title: string;
  subtitle: string;
  items: TestimonialEntry[];
};

export type ContactContent = {
  phone: string;
  email: string;
  facebookUrl: string;
  facebookLabel: string;
  instagramUrl: string;
  instagramLabel: string;
  tiktokUrl: string;
  tiktokLabel: string;
};

export type SiteContentMap = {
  hero: HeroContent;
  about: AboutContent;
  schedule: ScheduleContent;
  testimonials: TestimonialsContent;
  contact: ContactContent;
  legalImprint: LegalPageContent;
  legalPrivacy: LegalPageContent;
  legalTerms: LegalPageContent;
  legalCookies: LegalPageContent;
};

export type LegalPageContent = {
  lastUpdated: string;
  html: string;
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
    subtitle: 'Tervezz előre – válassz egy időpontot a naptárból.',
  },
  testimonials: {
    title: 'Vendégeink mesélik',
    subtitle:
      'Néhány őszinte sor azoktól, akik már együtt utaztak velünk – és pár kép az élményekből.',
    items: [
      {
        id: 't1',
        name: 'Anna',
        trip: 'Toszkána – 2025 ősz',
        quote:
          '„Olyan volt, mint egy hosszú baráti utazás: minden helyszín gondosan előkészítve, minden étterem megérte. A képek pedig… azokat soha nem csináltam volna meg magamnak.”',
        photoUrl: '/images/toscana.jpeg',
        photoAlt: 'Toszkán dombok napsütésben',
        rating: 5,
      },
      {
        id: 't2',
        name: 'Eszter',
        trip: 'Nápoly–Amalfi–Capri',
        quote:
          '„Sosem hittem, hogy egy utazás után ennyire feltöltődve jövök haza. Zsuzsi tényleg odafigyel a részletekre, és úgy fényképezett, hogy közben végig önmagam maradtam.”',
        photoUrl: '/images/napoly.jpeg',
        photoAlt: 'Amalfi-part kilátás',
        rating: 5,
      },
      {
        id: 't3',
        name: 'Katalin',
        trip: 'Szicília – narancsszüret',
        quote:
          '„A program tökéletesen kiegyensúlyozott volt: kultúra, kaja, pihenés – és minden nap volt egy „ezt sose felejtem el” pillanat. Szívből ajánlom mindenkinek.”',
        photoUrl: '/images/szicilia.jpeg',
        photoAlt: 'Szicíliai narancsliget',
        rating: 5,
      },
      {
        id: 't4',
        name: 'Mária',
        trip: 'Róma',
        quote:
          '„Először mentem egyedül kiscsoportos útra, és a végére úgy éreztem, családtaggal jöttem haza. A fotók pedig olyan emlékek, amiket most már soha nem veszítek el.”',
        photoUrl: '/images/roma.jpeg',
        photoAlt: 'Római utca esti fényben',
        rating: 5,
      },
    ],
  },
  contact: {
    phone: '+36 30 247 3323',
    email: 'utazoelmenyfotos@gmail.com',
    facebookUrl:
      'https://www.facebook.com/groups/702270205143442',
    facebookLabel: 'Utazó fotós Facebook csoport',
    instagramUrl: '',
    instagramLabel: '@utazofotos',
    tiktokUrl: '',
    tiktokLabel: '@utazofotos',
  },
  legalImprint: {
    lastUpdated: '2026-05-08',
    html: `<h2>Impresszum</h2>
<p>A 2001. évi CVIII. törvény (Ekertv.) 4. § alapján kötelező adatok:</p>
<dl>
  <dt>Vállalkozás neve</dt><dd>[KITÖLTENDŐ]</dd>
  <dt>Székhely</dt><dd>[KITÖLTENDŐ]</dd>
  <dt>Adószám</dt><dd>[KITÖLTENDŐ]</dd>
  <dt>Nyilvántartási szám</dt><dd>[KITÖLTENDŐ]</dd>
  <dt>E-mail</dt><dd>[KITÖLTENDŐ]</dd>
  <dt>Telefon</dt><dd>[KITÖLTENDŐ]</dd>
  <dt>Tárhelyszolgáltató</dt><dd>Vercel Inc., 340 Pine Street Suite 900, San Francisco, CA 94104, USA — <a href="https://vercel.com" target="_blank" rel="noopener">vercel.com</a></dd>
</dl>
<p>A webhely üzemeltetésére a magyar jog, különösen a 2001. évi CVIII. törvény az irányadó.</p>`,
  },
  legalPrivacy: {
    lastUpdated: '2026-05-08',
    html: `<h2>Adatvédelmi tájékoztató</h2>
<p>Hatályos: [KITÖLTENDŐ dátum]. Az adatkezelés az EU 2016/679 rendeletével (GDPR) összhangban történik.</p>

<h3>1. Adatkezelő</h3>
<dl>
  <dt>Név</dt><dd>[KITÖLTENDŐ]</dd>
  <dt>Cím</dt><dd>[KITÖLTENDŐ]</dd>
  <dt>E-mail</dt><dd>[KITÖLTENDŐ]</dd>
</dl>

<h3>2. Kezelt adatok és céljaik</h3>
<table>
  <thead><tr><th>Adat</th><th>Cél</th><th>Jogalap</th><th>Megőrzés</th></tr></thead>
  <tbody>
    <tr><td>Név, e-mail, telefonszám</td><td>Jelentkezés feldolgozása, visszaigazolás</td><td>GDPR 6. cikk (1) b) — szerződés teljesítése</td><td>Az utazás teljesítésétől számított 5 év</td></tr>
    <tr><td>IP-cím (szerver napló)</td><td>Biztonság, hibaelhárítás</td><td>GDPR 6. cikk (1) f) — jogos érdek</td><td>90 nap</td></tr>
  </tbody>
</table>

<h3>3. Adatfeldolgozók</h3>
<ul>
  <li><strong>Vercel Inc.</strong> — tárhelyszolgáltatás (USA, megfelelő garanciák: SCCs)</li>
  <li><strong>Supabase Inc.</strong> — adatbázis (EU régió: eu-west-1)</li>
  <li><strong>[KITÖLTENDŐ — pl. e-mail szolgáltató]</strong> — értesítések küldése</li>
</ul>

<h3>4. Érintetti jogok</h3>
<p>Hozzáférés, helyesbítés, törlés, adathordozhatóság, tiltakozás joga. Kérelemmel forduljon hozzánk: <strong>[KITÖLTENDŐ e-mail]</strong>. Jogorvoslat: <a href="https://naih.hu" target="_blank" rel="noopener">NAIH (naih.hu)</a>.</p>

<h3>5. Adatbiztonság</h3>
<p>Az adatokat titkosított kapcsolaton (HTTPS/TLS) keresztül kezeljük. A rendszer hozzáférése jelszóval védett, harmadik féllel az adatokat nem osztjuk meg.</p>`,
  },
  legalTerms: {
    lastUpdated: '2026-05-08',
    html: `<h2>Általános Szerződési Feltételek (ÁSZF)</h2>
<p>Hatályos: [KITÖLTENDŐ dátum].</p>

<h3>1. Szerződő felek</h3>
<p><strong>Szolgáltató:</strong> [KITÖLTENDŐ vállalkozás neve, székhely, adószám]<br>
<strong>Ügyfél:</strong> a jelentkezési űrlapot kitöltő természetes személy.</p>

<h3>2. A szerződés létrejötte</h3>
<p>A szerződés az ügyfél online jelentkezésének elküldésével és az e-mailes visszaigazolással jön létre. A visszaigazolás nem automatikus — a szolgáltató fenntartja a foglalás elfogadásának vagy elutasításának jogát.</p>

<h3>3. Részvételi díj és fizetés</h3>
<ul>
  <li>A részvételi díj az utazás oldalán feltüntetett összeg.</li>
  <li>Foglaláskor <strong>[KITÖLTENDŐ, pl. 30%]</strong> előleg fizetendő, a fennmaradó összeg legkésőbb az indulás előtt <strong>[KITÖLTENDŐ, pl. 30]</strong> nappal esedékes.</li>
  <li>Fizetési mód: [KITÖLTENDŐ — pl. banki átutalás, iban, stb.]</li>
</ul>

<h3>4. Lemondás, visszatérítés</h3>
<ul>
  <li>Az indulás előtt több mint 45 nappal: a befizetett összeg <strong>teljes egészében</strong> visszajár.</li>
  <li>45–30 nap: <strong>50%</strong> visszatérítés.</li>
  <li>30 napon belül: <strong>nem jár visszatérítés</strong>, kivéve, ha az ügyfél helyett mást küld.</li>
  <li>Vis maior esetén (pl. járványügyi tilalom, természeti katasztrófa) egyedi elbírálás alapján jóváírás vagy visszatérítés lehetséges.</li>
</ul>

<h3>5. A szolgáltató felelőssége</h3>
<p>A szolgáltató az utazás lebonyolítását legjobb tudása szerint szervezi. Nem vállal felelősséget az utazón kívül álló körülmények (időjárás, sztrájk, hatósági intézkedés) által okozott esetleges változásokért.</p>

<h3>6. Panaszkezelés</h3>
<p>Panasz esetén: <strong>[KITÖLTENDŐ e-mail]</strong>. A beérkező panaszokra 15 munkanapon belül írásban válaszolunk. Vitás ügyekben a felek elsősorban peren kívüli megegyezésre törekszenek; ennek eredménytelensége esetén a [KITÖLTENDŐ — illetékes bíróság] illetékes.</p>

<h3>7. Alkalmazandó jog</h3>
<p>A szerződésre a magyar jog, különösen a Ptk. és az utazási szerződésre vonatkozó jogszabályok az irányadók.</p>`,
  },
  legalCookies: {
    lastUpdated: '2026-05-08',
    html: `<h2>Sütitájékoztató</h2>
<p>Hatályos: [KITÖLTENDŐ dátum].</p>

<h3>Milyen sütiket használunk?</h3>
<table>
  <thead><tr><th>Süti neve</th><th>Típus</th><th>Cél</th><th>Lejárat</th></tr></thead>
  <tbody>
    <tr><td>next-auth.session-token</td><td>Munkamenet (technikai)</td><td>Admin bejelentkezés fenntartása</td><td>Session / 30 nap</td></tr>
    <tr><td>next-auth.csrf-token</td><td>Biztonsági (technikai)</td><td>CSRF-támadás elleni védelem</td><td>Session</td></tr>
  </tbody>
</table>

<h3>Harmadik féltől származó sütik</h3>
<p>A webhely jelenleg <strong>nem használ</strong> marketing-, analitikai vagy közösségi media sütiket (pl. Google Analytics, Meta Pixel).</p>

<h3>Sütik letiltása</h3>
<p>A sütik böngészőben letilthatók (Beállítások → Adatvédelem / Sütik), de a technikai sütik kikapcsolása az admin felület működését befolyásolhatja. A nyilvános oldal sütik nélkül is teljes értékűen működik.</p>`,
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
