import 'server-only';
import { auth } from '@/auth';

/**
 * Megnézi, hogy a kérést admin user küldte-e (be van-e jelentkezve).
 * Csak a publikus oldalakon haszn\u00e1ljuk a "Szerkeszt\u00e9s" lebegő gomb
 * megjelenítéséhez. NEM ad sehol jogot \u2014 az\u00e9rt csak az admin oldalak
 * routeing v\u00e9dik a tartalmat a (protected) layoutban.
 */
export async function isAdminViewer(): Promise<boolean> {
  const session = await auth();
  return Boolean(session?.user);
}
