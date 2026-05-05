export { auth as middleware } from '@/auth';

export const config = {
  // Csak az /admin alatti útvonalak. A bejelentkező oldal kivétel az authorized() callback-ben.
  matcher: ['/admin/:path*'],
};
