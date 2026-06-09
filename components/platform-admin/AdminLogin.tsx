'use client';

import Image from 'next/image';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Inloggen mislukt');
      }
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inloggen mislukt');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(216,189,113,0.06) 0%, transparent 60%)' }}
    >
      <div className="w-full max-w-[440px] bg-velaro-surf1 border border-white/[0.08] rounded-3xl p-12">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Velaro" width={160} height={36} className="mx-auto mb-6" />
          <span className="text-[10px] bg-velaro-gold/10 border border-velaro-gold/20 text-velaro-gold px-3 py-1 rounded-full tracking-[1px] uppercase">
            Platform Beheer · Beperkte toegang
          </span>
          <h1 className="font-serif text-[38px] font-light mt-4 mb-1 leading-tight">
            Admin<em className="text-velaro-gold not-italic"> toegang</em>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="label">E-mailadres</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@velaro.nl"
              autoComplete="email"
            />
          </div>
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
          <button className="btn-primary w-full py-4" type="submit" disabled={loading}>
            {loading ? 'Bezig…' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  );
}
