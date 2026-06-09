'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import AuthView    from './AuthView';
import Dashboard   from './Dashboard';
import ShootDetail from './ShootDetail';
import NewShootForm from './NewShootForm';
import type { Shoot, View } from './types';
import { apiFetch } from './utils';

export default function AdminApp() {
  const [view, setView]         = useState<View>('auth');
  const [shoots, setShoots]     = useState<Shoot[]>([]);
  const [current, setCurrent]   = useState<Shoot | null>(null);
  const [loading, setLoading]   = useState(false);

  const loadShoots = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/shoots');
      setShoots(data.shoots ?? []);
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleAuthSuccess() {
    const ok = await loadShoots();
    if (ok) setView('dashboard');
  }

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    setView('auth');
    setShoots([]);
    setCurrent(null);
  }

  function handleOpenShoot(shoot: Shoot) {
    setCurrent(shoot);
    setView('detail');
  }

  function handleShootUpdated(updated: Shoot) {
    setShoots(prev => prev.map(s => s.id === updated.id ? updated : s));
    if (current?.id === updated.id) setCurrent(updated);
  }

  function handleShootCreated(shoot: Shoot) {
    setShoots(prev => [shoot, ...prev]);
    setCurrent(shoot);
    setView('detail');
  }

  function handleShootDeleted() {
    if (current) setShoots(prev => prev.filter(s => s.id !== current.id));
    setCurrent(null);
    setView('dashboard');
  }

  useEffect(() => {
    loadShoots().then(ok => { if (ok) setView('dashboard'); });
  }, [loadShoots]);

  if (loading && view === 'auth') {
    return <div className="min-h-screen flex items-center justify-center text-velaro-muted text-sm">Laden…</div>;
  }

  if (view === 'auth') {
    return <AuthView onSuccess={handleAuthSuccess} />;
  }

  if (view === 'new') {
    return (
      <NewShootForm
        onBack={() => setView('dashboard')}
        onCreated={handleShootCreated}
      />
    );
  }

  if (view === 'detail' && current) {
    return (
      <ShootDetail
        shoot={current}
        onBack={() => setView('dashboard')}
        onUpdated={handleShootUpdated}
        onDeleted={handleShootDeleted}
      />
    );
  }

  if (view === 'settings') {
    return (
      <div>
        <nav className="bg-velaro-surf1 border-b border-white/[0.08] px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <button className="btn-ghost" onClick={() => setView('dashboard')}>← Dashboard</button>
            <span className="text-white/20">|</span>
            <Image src="/logo.png" alt="Velaro" width={140} height={32} />
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="card max-w-lg">
            <h2 className="font-serif text-xl font-light mb-3">Admin wachtwoord wijzigen</h2>
            <p className="text-sm text-velaro-muted leading-relaxed">
              Pas{' '}
              <code className="bg-velaro-surf2 border border-white/[0.08] px-1.5 py-0.5 rounded text-xs font-mono text-velaro-gold">
                ADMIN_PASSWORD
              </code>{' '}
              aan in je Vercel environment variables en herdeployeer.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <Dashboard
      shoots={shoots}
      onOpen={handleOpenShoot}
      onNew={() => setView('new')}
      onSettings={() => setView('settings')}
      onLogout={handleLogout}
    />
  );
}
