'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function signInAction(input: {
  email: string;
  password: string;
  callbackUrl: string;
}): Promise<{ error?: string } | undefined> {
  try {
    await signIn('credentials', {
      email: input.email,
      password: input.password,
      redirect: false,
    });
    return undefined;
  } catch (e) {
    if (e instanceof AuthError) {
      if (e.type === 'CredentialsSignin') {
        return { error: 'Hibás email vagy jelszó.' };
      }
      return { error: 'Belépési hiba. Próbáld újra.' };
    }
    throw e;
  }
}
