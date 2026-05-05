'use client';

import { Suspense, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInAction } from './actions';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="admin-login-shell" />}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signInAction({ email, password, callbackUrl });
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    });
  }

  return (
    <div className="admin-login-shell">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <span className="admin-login-mark">UF</span>
          <div>
            <div className="admin-login-title">UtazóFotós</div>
            <div className="admin-login-sub">Admin belépés</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="admin-login-form" noValidate>
          <label className="admin-login-label">
            Email cím
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              autoFocus
              className="admin-login-input"
            />
          </label>
          <label className="admin-login-label">
            Jelszó
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="admin-login-input"
            />
          </label>

          {error && <div className="admin-login-error">{error}</div>}

          <button
            type="submit"
            disabled={pending}
            className="admin-login-button"
          >
            {pending ? 'Belépés…' : 'Belépés'}
          </button>
        </form>
      </div>
    </div>
  );
}
