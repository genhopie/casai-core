'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, authApiUrl } from '../../lib/api';
import { useVaultSession } from '../../components/vault-provider';

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { login } = useVaultSession();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const data = await apiRequest<AuthResponse>(`${authApiUrl}/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      const me = await apiRequest<{ id: string }>(`${authApiUrl}/me`, { method: 'GET' }, data.accessToken);
      await login(me.id, data.accessToken, password);
      router.push('/dashboard');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">{mode === 'login' ? 'Login' : 'Register'}</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input value={email} onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)} className="w-full p-2" placeholder="Email" type="email" required />
        <input value={password} onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)} className="w-full p-2" placeholder="Password" type="password" minLength={8} required />
        {error ? <p className="text-red-400 text-sm">{error}</p> : null}
        <button className="w-full bg-indigo-600 py-2" disabled={busy} type="submit">
          {busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
      <button
        className="text-sm text-slate-300"
        onClick={() => setMode((current: 'login' | 'register') => (current === 'login' ? 'register' : 'login'))}
      >
        Switch to {mode === 'login' ? 'register' : 'login'}
      </button>
      <p className="text-xs text-slate-400">Password is held in memory only for active vault session and never stored.</p>
    </div>
  );
}
