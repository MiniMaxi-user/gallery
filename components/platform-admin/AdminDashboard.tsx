'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { PhotographerUser } from '@/lib/types';

interface Stats {
  totalPhotographers: number;
  activePhotographers: number;
  totalGalleries: number;
  totalPhotos: number;
}

export default function AdminDashboard() {
  const router = useRouter();

  const [photographers, setPhotographers] = useState<PhotographerUser[]>([]);
  const [stats,         setStats]         = useState<Stats | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showAddForm,   setShowAddForm]   = useState(false);
  const [addName,       setAddName]       = useState('');
  const [addEmail,      setAddEmail]      = useState('');
  const [addError,      setAddError]      = useState('');
  const [addLoading,    setAddLoading]    = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [photoRes, statsRes] = await Promise.all([
        fetch('/api/admin/photographers'),
        fetch('/api/admin/stats'),
      ]);
      if (photoRes.ok) {
        const d = await photoRes.json();
        setPhotographers(d.photographers ?? []);
      }
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin');
  }

  async function toggleActive(p: PhotographerUser) {
    const res = await fetch(`/api/admin/photographers/${p.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ isActive: !p.isActive }),
    });
    if (res.ok) {
      const { photographer } = await res.json();
      setPhotographers(prev => prev.map(x => x.id === p.id ? photographer : x));
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/photographers/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setPhotographers(prev => prev.filter(x => x.id !== id));
      setConfirmDelete(null);
      loadData(); // refresh stats
    }
  }

  async function handleAddPhotographer(e: React.FormEvent) {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    try {
      const res = await fetch('/api/admin/photographers', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: addName, email: addEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Toevoegen mislukt');
      setPhotographers(prev => [...prev, data.photographer]);
      setStats(s => s ? { ...s, totalPhotographers: s.totalPhotographers + 1, activePhotographers: s.activePhotographers + 1 } : s);
      setShowAddForm(false);
      setAddName('');
      setAddEmail('');
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Toevoegen mislukt');
    } finally {
      setAddLoading(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  return (
    <div>
      <nav className="bg-velaro-surf1 border-b border-white/[0.08] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Velaro" width={140} height={32} />
            <span className="text-[10px] text-velaro-gold tracking-widest uppercase border border-velaro-gold/20 bg-velaro-gold/10 px-2.5 py-1 rounded-full">
              Platform Admin
            </span>
          </div>
          <button className="btn-ghost text-xs" onClick={handleLogout}>Uitloggen</button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Fotografen",         value: stats?.totalPhotographers  ?? '—' },
            { label: "Actief",             value: stats?.activePhotographers ?? '—' },
            { label: "Galerijen",          value: stats?.totalGalleries      ?? '—' },
            { label: "Foto's",             value: stats?.totalPhotos         ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="card text-center py-5">
              <p className="text-3xl font-serif font-light text-white">{value}</p>
              <p className="text-[11px] text-velaro-muted tracking-widest uppercase mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Photographers */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl font-light">Fotografen</h2>
            <button className="btn-primary text-xs px-4 py-2" onClick={() => { setShowAddForm(v => !v); setAddError(''); }}>
              {showAddForm ? 'Annuleren' : '+ Fotograaf toevoegen'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddPhotographer} className="card mb-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="label">Naam</label>
                <input className="input" value={addName} onChange={e => setAddName(e.target.value)} required placeholder="Voornaam Achternaam" />
              </div>
              <div className="flex-1">
                <label className="label">E-mail</label>
                <input className="input" type="email" value={addEmail} onChange={e => setAddEmail(e.target.value)} required placeholder="naam@studio.nl" />
              </div>
              <div className="flex items-end gap-2">
                {addError && <p className="error-box text-xs">{addError}</p>}
                <button className="btn-primary px-6 py-3.5" type="submit" disabled={addLoading}>
                  {addLoading ? 'Bezig…' : 'Toevoegen'}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <p className="text-velaro-muted text-sm py-8 text-center">Laden…</p>
          ) : photographers.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-velaro-muted mb-2">Nog geen fotografen geregistreerd.</p>
              <button
                className="text-velaro-gold underline text-sm hover:opacity-80 transition-opacity"
                onClick={() => setShowAddForm(true)}
              >
                Voeg de eerste fotograaf toe
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {photographers.map(p => (
                <div key={p.id} className="card">
                  {confirmDelete === p.id ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">{p.name}</p>
                        <p className="text-xs text-red-400 mt-0.5">
                          Alle galerijen en foto&apos;s van dit account worden permanent verwijderd.
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button className="btn-ghost text-xs" onClick={() => setConfirmDelete(null)}>Annuleren</button>
                        <button className="btn-danger text-xs px-4 py-2" onClick={() => handleDelete(p.id)}>
                          Definitief verwijderen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-white">{p.name}</p>
                          <span className={`badge text-[10px] ${p.isActive ? 'bg-green-500/15 text-green-300' : 'bg-white/[0.08] text-velaro-muted'}`}>
                            {p.isActive ? 'Actief' : 'Inactief'}
                          </span>
                        </div>
                        <p className="text-xs text-velaro-muted mt-0.5 truncate">{p.email}</p>
                        <p className="text-xs text-velaro-muted/60 mt-0.5">Geregistreerd: {formatDate(p.registeredAt)}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          className="btn-secondary text-xs px-3 py-1.5"
                          onClick={() => toggleActive(p)}
                        >
                          {p.isActive ? 'Deactiveren' : 'Activeren'}
                        </button>
                        <button
                          className="btn-danger text-xs px-3 py-1.5"
                          onClick={() => setConfirmDelete(p.id)}
                        >
                          Verwijderen
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
