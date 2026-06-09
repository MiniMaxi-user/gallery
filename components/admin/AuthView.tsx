'use client';

import Image from 'next/image';
import { useState, FormEvent } from 'react';
import { apiFetch } from './utils';

export default function AuthView({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inloggen mislukt');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-sm">
        <div className="text-center mb-6">
          <Image src="/logo.png" alt="Velaro" width={200} height={44} className="mx-auto mb-2" />
          <h1 className="font-bold text-xl">Velaro</h1>
          <p className="text-warm-muted text-xs mt-1">Fotografenbeheer</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="label">Wachtwoord</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="error-box">{error}</p>}
          <button className="btn-primary w-full py-2" type="submit" disabled={loading}>
            {loading ? 'Bezig…' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  );
}
