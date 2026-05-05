import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

/**
 * Auth.js v5 konfiguráció.
 *
 * - JWT session (nincs adatbázis-session tábla → kevesebb kapcsolat).
 * - Credentials provider (email + jelszó). Nincs külső szolgáltatás.
 * - Belépő oldal: /admin/login
 *
 * Az AUTH_SECRET-et a .env.local tartalmazza.
 */

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/admin/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Jelszó', type: 'password' },
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // utolsó belépés frissítése (best-effort)
        try {
          await db
            .update(users)
            .set({ lastLoginAt: new Date() })
            .where(eq(users.id, user.id));
        } catch {
          /* nem kritikus */
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: 'admin' | 'editor' }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string | undefined;
        (session.user as { role?: 'admin' | 'editor' }).role =
          token.role as 'admin' | 'editor' | undefined;
      }
      return session;
    },
    authorized({ auth, request }) {
      const isOnAdmin = request.nextUrl.pathname.startsWith('/admin');
      const isOnLogin = request.nextUrl.pathname === '/admin/login';
      if (isOnLogin) return true;
      if (isOnAdmin) return !!auth?.user;
      return true;
    },
  },
});
