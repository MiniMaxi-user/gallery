'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Lightbox from './Lightbox';
import type { Shoot } from '@/lib/types';

interface Props {
  shootId: string;
}

type Phase = 'login' | 'gallery' | 'thankyou';

interface Session {
  shootId: number;
  clientName: string;
  email: string;
}

export default function GalleryApp({ shootId }: Props) {
  const [phase, setPhase]       = useState<Phase>('login');
  const [shoot, setShoot]       = useState<Omit<Shoot, 'password'> | null>(null);
  const [session, setSession]   = useState<Session | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [lbIndex, setLbIndex]   = useState(-1);

  const SESSION_KEY = `gal_${shootId}`;

  useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        const sess = JSON.parse(raw) as Session;
        setSession(sess);
        fetchShoot(sess);
      } catch {
        // invalid session, show login
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchShoot(_sess: Session) {
    const res = await fetch(`/api/shoots/${shootId}`);
    if (!res.ok) { sessionStorage.removeItem(SESSION_KEY); return; }
    const data = await res.json();
    setShoot(data);
    if (data.selectionSubmitted) {
      setSubmitted(true);
      setSelected(new Set(data.selections ?? []));
    }
    setPhase('gallery');
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch(`/api/gallery/${shootId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        setLoginError(err.error ?? 'Inloggen mislukt');
        return;
      }
      const data = await res.json();
      const sess: Session = { shootId: Number(shootId), clientName: data.clientName, email };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sess));
      setSession(sess);
      setShoot(data);
      if (data.selectionSubmitted) {
        setSubmitted(true);
        setSelected(new Set(data.selections ?? []));
      }
      setPhase('gallery');
    } finally {
      setLoginLoading(false);
    }
  }

  async function submitSelection() {
    if (selected.size === 0) { alert('Selecteer minimaal één foto.'); return; }
    const selections = Array.from(selected);
    try {
      await fetch(`/api/gallery/${shootId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selections }),
      });
    } catch { /* fire and forget */ }
    setSubmitted(true);
    setPhase('thankyou');
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.reload();
  }

  function toggleSelect(url: string) {
    if (submitted) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url); else next.add(url);
      return next;
    });
  }

  // ── LOGIN ──
  if (phase === 'login') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(216,189,113,0.06) 0%, transparent 60%)' }}
      >
        <div className="w-full max-w-[440px] bg-velaro-surf1 border border-white/[0.08] rounded-3xl p-12 relative">
          <div className="text-center mb-8">
            <Image src="/logo.png" alt="Velaro" width={160} height={36} className="mx-auto mb-6" />
            <span className="text-[10px] bg-velaro-gold/10 border border-velaro-gold/20 text-velaro-gold px-3 py-1 rounded-full tracking-[1px] uppercase">
              Galerij · Besloten toegang
            </span>
            <h1 className="font-serif text-[38px] font-light mt-4 mb-1 leading-tight">
              Uw <em className="text-velaro-gold not-italic">foto&apos;s</em>
            </h1>
            <p className="text-velaro-muted text-sm mt-1">Log in om uw galerij te bekijken</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="label">E-mailadres</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="jouw@email.nl" autoComplete="email" />
            </div>
            <div>
              <label className="label">Wachtwoord</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            {loginError && <p className="error-box">{loginError}</p>}
            <button className="btn-primary w-full py-4" type="submit" disabled={loginLoading}>
              {loginLoading ? 'Bezig…' : "Bekijk mijn foto's"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── THANK YOU ──
  if (phase === 'thankyou') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(216,189,113,0.06) 0%, transparent 60%)' }}
      >
        <div className="text-center max-w-sm">
          <Image src="/logo.png" alt="Velaro" width={160} height={36} className="mx-auto mb-8" />
          <h2 className="font-serif text-5xl font-light mb-4">
            <em className="text-velaro-gold not-italic">Dankjewel!</em>
          </h2>
          <p className="text-white text-base leading-relaxed">Je fotoselectie is doorgegeven aan de fotograaf.</p>
          <p className="text-velaro-muted text-sm mt-2">{selected.size} foto{selected.size !== 1 ? "'s" : ''} geselecteerd.</p>
          <button className="btn-ghost mt-8 block mx-auto" onClick={logout}>Uitloggen</button>
        </div>
      </div>
    );
  }

  // ── GALLERY ──
  if (!shoot) return null;
  const photos   = shoot.photos ?? [];
  const selCount = selected.size;

  return (
    <div>
      <nav className="bg-velaro-surf1/90 backdrop-blur-xl border-b border-white/[0.08] px-6 py-4 sticky top-0 z-10">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <div>
            <Image src="/logo.png" alt="Velaro" width={140} height={32} />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-velaro-muted hidden sm:block">Welkom, {session?.clientName}</span>
            <button className="btn-ghost text-sm" onClick={logout}>Uitloggen</button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="font-serif text-3xl font-light">Jouw foto&apos;s</h1>
            <p className="text-xs text-velaro-muted mt-1">
              {photos.length} foto{photos.length !== 1 ? "'s" : ''}{!submitted ? ` · ${selCount} geselecteerd` : ''}
            </p>
            {!submitted && <p className="text-xs text-velaro-muted mt-0.5">Klik op een foto om te selecteren. Gebruik het vergrootglas om te vergroten.</p>}
          </div>
          <div>
            {submitted ? (
              <span className="badge bg-green-500/15 text-green-300">✓ Selectie verzonden</span>
            ) : selCount > 0 ? (
              <button className="btn-primary" onClick={submitSelection}>Verstuur selectie ({selCount})</button>
            ) : (
              <span className="badge bg-amber-400/15 text-amber-300">Wacht op selectie</span>
            )}
          </div>
        </div>

        {photos.length === 0 ? (
          <p className="text-velaro-muted text-center py-16">Nog geen foto&apos;s beschikbaar. Kom later terug.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {photos.map((url, i) => {
              const sel = selected.has(url);
              return (
                <div
                  key={url}
                  className={`photo-item relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all select-none ${
                    sel
                      ? 'border-velaro-gold shadow-[0_0_0_1px_rgba(216,189,113,0.4)]'
                      : 'border-white/[0.08] hover:border-white/25'
                  }`}
                  onClick={() => toggleSelect(url)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Foto ${i + 1}`} className="w-full aspect-square object-cover block pointer-events-none" draggable={false} onContextMenu={e => e.preventDefault()} />
                  {sel && (
                    <div className="absolute inset-0 bg-velaro-gold/15 flex items-center justify-center pointer-events-none">
                      <div className="bg-velaro-gold rounded-full w-8 h-8 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B0B0D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    </div>
                  )}
                  <div className={`absolute bottom-0 inset-x-0 px-2 py-1.5 text-center text-xs font-semibold pointer-events-none ${sel ? 'bg-velaro-gold/80 text-velaro-bg' : 'bg-black/55 text-white'}`}>
                    {sel ? '✓ Geselecteerd' : (submitted ? '' : 'Selecteer')}
                  </div>
                  <button
                    className="photo-zoom-btn z-10"
                    title="Vergroten"
                    onClick={e => { e.stopPropagation(); setLbIndex(i); }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!submitted && photos.length > 0 && (
          <div className="text-center mt-10">
            <button
              className="btn-primary px-10 py-4"
              disabled={selCount === 0}
              onClick={submitSelection}
            >
              {selCount === 0 ? "Selecteer foto's om te verzenden" : `Verstuur mijn selectie (${selCount})`}
            </button>
            {selCount === 0 && <p className="text-velaro-muted text-xs mt-3">Klik op een foto om te selecteren.</p>}
          </div>
        )}
      </main>

      {lbIndex >= 0 && (
        <Lightbox
          photos={photos}
          index={lbIndex}
          selected={selected.has(photos[lbIndex])}
          submitted={submitted}
          onClose={() => setLbIndex(-1)}
          onNav={dir => setLbIndex(i => (i + dir + photos.length) % photos.length)}
          onToggle={() => toggleSelect(photos[lbIndex])}
        />
      )}
    </div>
  );
}
