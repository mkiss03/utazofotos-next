import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Storage kliens — csak szerver oldalon.
 * A SERVICE_ROLE kulcs admin jogokkal rendelkezik, NE legyen kliens-oldali kódban.
 *
 * Előfeltétel: hozz létre a Supabase Storage-ban egy `media` nevű bucket-et,
 * publikus olvasással. (Dashboard → Storage → New bucket → name: media → Public)
 */

let cachedClient: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Hiányzó SUPABASE_URL vagy SUPABASE_SERVICE_ROLE_KEY az .env.local fájlból.',
    );
  }

  cachedClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}

export const MEDIA_BUCKET = 'media';

/**
 * Visszaadja a tárolt fájl publikus URL-jét.
 */
export function getPublicUrl(pathname: string): string {
  const client = getSupabaseAdminClient();
  const { data } = client.storage.from(MEDIA_BUCKET).getPublicUrl(pathname);
  return data.publicUrl;
}

/**
 * Egyedi, ütközésmentes pathname előállítása a feltöltött fájlokhoz.
 * Példa: 2026/05/uticelok-velence-tava-1715090210123.jpg
 */
export function buildMediaPathname(originalName: string): string {
  const safe = originalName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const ts = now.getTime();

  // Külön fájlnév + kiterjesztés
  const dot = safe.lastIndexOf('.');
  const base = dot > 0 ? safe.slice(0, dot) : safe;
  const ext = dot > 0 ? safe.slice(dot) : '';

  return `${yyyy}/${mm}/${base}-${ts}${ext}`;
}

/**
 * Fájl feltöltése a `media` bucket-be.
 */
export async function uploadToStorage(
  pathname: string,
  body: ArrayBuffer | Buffer | Blob,
  contentType: string,
): Promise<void> {
  const client = getSupabaseAdminClient();
  const { error } = await client.storage
    .from(MEDIA_BUCKET)
    .upload(pathname, body, {
      contentType,
      upsert: false,
      cacheControl: '31536000', // 1 év — a fájlnév úgyis tartalmaz timestamp-et
    });
  if (error) {
    throw new Error(`Feltöltési hiba: ${error.message}`);
  }
}

/**
 * Fájl törlése a Storage-ból.
 */
export async function deleteFromStorage(pathname: string): Promise<void> {
  const client = getSupabaseAdminClient();
  const { error } = await client.storage.from(MEDIA_BUCKET).remove([pathname]);
  if (error) {
    throw new Error(`Törlési hiba: ${error.message}`);
  }
}
