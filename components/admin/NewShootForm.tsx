'use client';

import Image from 'next/image';
import { useState, FormEvent } from 'react';
import { generatePassword, apiFetch } from './utils';
import type { Shoot } from './types';

interface Props {
  onBack:    () => void;
  onCreated: (shoot: Shoot) => void;
}

export default function NewShootForm({ onBack, onCreated }: Props) {
  const [name, setName]               = useState('');
  const [date, setDate]               = useState('');
  const [clientName, setClientName]   = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [password, setPassword]       = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const shoot = await apiFetch('/api/shoots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, date, clientName, clientEmail, password }),
      });
      onCreated(shoot);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aanmaken mislukt');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <nav className="bg-velaro-surf1 border-b border-white/[0.08] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button className="btn-ghost" onClick={onBack}>← Dashboard</button>
          <span className="text-white/20">|</span>
          <Image src="/logo.png" alt="Velaro" width={140} height={32} />
          <span className="font-medium text-white">Nieuwe Shoot</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="card max-w-lg">
          <h2 className="font-serif text-2xl font-light mb-5">Shoot aanmaken</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label">Naam shoot</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} required placeholder="bijv. Zomershoot Emma" />
            </div>
            <div>
              <label className="label">Datum</label>
              <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <hr className="border-white/[0.08]" />
            <div>
              <label className="label">Naam klant</label>
              <input className="input" value={clientName} onChange={e => setClientName(e.target.value)} required />
            </div>
            <div>
              <label className="label">E-mail klant</label>
              <input className="input" type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Wachtwoord klant</label>
              <div className="flex gap-2">
                <input className="input flex-1" value={password} onChange={e => setPassword(e.target.value)} required minLength={4} placeholder="bijv. paard2026" />
                <button type="button" className="btn-secondary whitespace-nowrap" onClick={() => setPassword(generatePassword())}>Genereer</button>
              </div>
              <p className="text-xs text-velaro-muted mt-1.5">Deel dit wachtwoord met de klant samen met de galerij-link.</p>
            </div>
            {error && <p className="error-box">{error}</p>}
            <button className="btn-primary w-full py-3" type="submit" disabled={loading}>
              {loading ? 'Bezig…' : 'Shoot aanmaken'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
