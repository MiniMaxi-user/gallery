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
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card w-full max-w-sm">
          <div className="text-center mb-7">
            <Image src="/logo.png" alt="Velaro" width={200} height={44} className="mx-auto mb-2.5" />
            <h1 className="font-bold text-2xl">Velaro</h1>
            <p className="text-warm-muted text-sm mt-1.5">Log in om je galerij te bekijken</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="label">E-mailadres</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="jouw@email.nl" autoComplete="email" />
            </div>
            <div>
              <label className="label">Wachtwoord</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            {loginError && <p className="error-box">{loginError}</p>}
            <button className="btn-primary w-full py-2.5 text-base" type="submit" disabled={loginLoading}>
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
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <Image src="/logo.png" alt="Velaro" width={200} height={44} className="mx-auto mb-5" />
          <h2 className="font-bold text-3xl mb-3">Bedankt!</h2>
          <p className="text-sage text-base leading-relaxed">Je fotoselectie is doorgegeven aan de fotograaf.</p>
          <p className="text-warm-muted text-sm mt-2">{selected.size} foto{selected.size !== 1 ? "'s" : ''} geselecteerd.</p>
          <button className="btn-ghost mt-7 block mx-auto" onClick={logout}>Uitloggen</button>
        </div>
      </div>
    );
  }

  // ── GALLERY ──
  if (!shoot) return null;
  const photos  = shoot.photos ?? [];
  const selCount = selected.size;

  return (
    <div>
      <nav className="bg-white border-b border-warm-border px-6 py-3">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <div>
            <Image src="/logo.png" alt="Velaro" width={180} height={40} />
            <p className="text-xs text-warm-muted mt-0.5">{shoot.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-warm-muted">Welkom, {session?.clientName}</span>
            <button className="btn-ghost text-sm" onClick={logout}>Uitloggen</button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="font-semibold text-xl">Jouw foto&apos;s</h1>
            <p className="text-xs text-warm-muted mt-1">
              {photos.length} foto{photos.length !== 1 ? "'s" : ''}{!submitted ? ` · ${selCount} geselecteerd` : ''}
            </p>
            {!submitted && <p className="text-xs text-warm-muted mt-0.5">Klik op een foto om te selecteren. Gebruik het vergrootglas om te vergroten.</p>}
          </div>
          <div>
            {submitted ? (
              <span className="badge bg-green-100 text-green-800">✓ Selectie verzonden</span>
            ) : selCount > 0 ? (
              <button className="btn-primary" onClick={submitSelection}>Verstuur selectie ({selCount})</button>
            ) : (
              <span className="badge bg-orange-100 text-orange-700">Wacht op selectie</span>
            )}
          </div>
        </div>

        {photos.length === 0 ? (
          <p className="text-warm-muted text-center py-16">Nog geen foto&apos;s beschikbaar. Kom later terug.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {photos.map((url, i) => {
              const sel = selected.has(url);
              return (
                <div
                  key={url}
                  className={`photo-item relative rounded-xl overflow-hidden border-[3px] cursor-pointer transition-all hover:shadow-xl select-none ${sel ? 'border-sage shadow-[0_0_0_1px_#5c8a6e]' : 'border-transparent'}`}
                  onClick={() => toggleSelect(url)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Foto ${i + 1}`} className="w-full aspect-square object-cover block pointer-events-none" draggable={false} onContextMenu={e => e.preventDefault()} />
                  {sel && (
                    <div className="absolute inset-0 bg-sage/18 flex items-center justify-center pointer-events-none">
                      <div className="bg-sage rounded-full w-8 h-8 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    </div>
                  )}
                  <div className={`absolute bottom-0 inset-x-0 px-2 py-1.5 text-center text-xs font-semibold text-white pointer-events-none ${sel ? 'bg-sage/85' : 'bg-black/45'}`}>
                    {sel ? '✓ Geselecteerd' : (submitted ? '' : 'Klik om te selecteren')}
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
          <div className="text-center mt-8">
            <button
              className="btn-primary px-9 py-3 text-base font-semibold disabled:bg-sage-light disabled:cursor-not-allowed"
              disabled={selCount === 0}
              onClick={submitSelection}
            >
              {selCount === 0 ? "Selecteer foto's om te verzenden" : `Verstuur mijn selectie (${selCount})`}
            </button>
            {selCount === 0 && <p className="text-warm-muted text-xs mt-2">Klik op een foto om te selecteren.</p>}
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
