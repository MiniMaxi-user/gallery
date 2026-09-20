'use client';

import Image from 'next/image';
import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { statusBadge, generatePassword, apiFetch } from './utils';
import type { Shoot, Album } from './types';

interface Props {
  shoot:     Shoot;
  onBack:    () => void;
  onUpdated: (shoot: Shoot) => void;
  onDeleted: () => void;
}

export default function ShootDetail({ shoot: initialShoot, onBack, onUpdated, onDeleted }: Props) {
  const [shoot, setShoot]           = useState(initialShoot);
  const [name, setName]             = useState(initialShoot.name);
  const [date, setDate]             = useState(initialShoot.date);
  const [clientName, setClientName] = useState(initialShoot.clientName);
  const [clientEmail, setClientEmail] = useState(initialShoot.clientEmail);
  const [password, setPassword]     = useState(initialShoot.password);
  const [editSaved, setEditSaved]   = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [uploadText, setUploadText] = useState('');
  const [uploadPct, setUploadPct]   = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [albums, setAlbums]                 = useState<Album[]>(initialShoot.albums ?? []);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [newAlbumName, setNewAlbumName]       = useState('');
  const [editingAlbumId, setEditingAlbumId]   = useState<string | null>(null);
  const [editingAlbumName, setEditingAlbumName] = useState('');

  useEffect(() => {
    setShoot(initialShoot);
    setName(initialShoot.name);
    setDate(initialShoot.date);
    setClientName(initialShoot.clientName);
    setClientEmail(initialShoot.clientEmail);
    setPassword(initialShoot.password);
    setAlbums(initialShoot.albums ?? []);
  }, [initialShoot]);

  const galleryUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/gallery/${shoot.id}`
    : `/gallery/${shoot.id}`;

  async function saveDetails() {
    if (!name || !clientName || !clientEmail) { alert('Vul alle verplichte velden in.'); return; }
    try {
      const updated = await apiFetch(`/api/shoots/${shoot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, date, clientName, clientEmail, password }),
      });
      setShoot(updated);
      onUpdated(updated);
      setEditSaved(true);
      setTimeout(() => setEditSaved(false), 2500);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Opslaan mislukt');
    }
  }

  async function setKlaar(klaar: boolean) {
    try {
      const body = klaar ? { status: 'klaar' } : { status: null };
      const updated = await apiFetch(`/api/shoots/${shoot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setShoot(updated);
      onUpdated(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Opslaan mislukt');
    }
  }

  async function deleteShoot() {
    if (!confirm(`Shoot "${shoot.name}" verwijderen?\n\nAlle foto's worden ook verwijderd. Weet je het zeker?`)) return;
    try {
      await apiFetch(`/api/shoots/${shoot.id}`, { method: 'DELETE' });
      onDeleted();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Verwijderen mislukt');
    }
  }

  async function saveAlbums(next: Album[]) {
    setAlbums(next);
    try {
      const updated = await apiFetch(`/api/shoots/${shoot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albums: next }),
      });
      setShoot(updated);
      onUpdated(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Opslaan mislukt');
    }
  }

  function createAlbum() {
    const name = newAlbumName.trim();
    if (!name) return;
    const album: Album = { id: crypto.randomUUID(), name, photos: [] };
    saveAlbums([...albums, album]);
    setNewAlbumName('');
  }

  function renameAlbum(id: string) {
    if (editingAlbumId !== id) return;
    const name = editingAlbumName.trim();
    setEditingAlbumId(null);
    if (!name) return;
    saveAlbums(albums.map(a => a.id === id ? { ...a, name } : a));
  }

  function deleteAlbum(id: string) {
    const album = albums.find(a => a.id === id);
    if (!album) return;
    if (!confirm(`Map "${album.name}" verwijderen?\n\nDe foto's blijven bewaard bij "Alle foto's".`)) return;
    saveAlbums(albums.filter(a => a.id !== id));
    if (selectedAlbumId === id) setSelectedAlbumId(null);
  }

  function setCover(albumId: string, url: string) {
    saveAlbums(albums.map(a => a.id === albumId ? { ...a, coverPhoto: url } : a));
  }

  function assignPhoto(url: string, albumId: string | null) {
    saveAlbums(albums.map(a => {
      const photos = a.photos.filter(p => p !== url);
      if (a.id === albumId) photos.push(url);
      return {
        ...a,
        photos,
        coverPhoto: a.coverPhoto === url && a.id !== albumId ? undefined : a.coverPhoto,
      };
    }));
  }

  function resizeImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const isLandscape = img.width > img.height;
        const scale = isLandscape
          ? (img.height > 600 ? 600 / img.height : 1)
          : (img.width  > 600 ? 600 / img.width  : 1);
        if (scale === 1) { resolve(file); return; }
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.85);
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    let current = shoot;
    let currentAlbums = albums;

    for (let i = 0; i < files.length; i++) {
      setUploadText(`Uploaden ${i + 1} van ${files.length}: ${files[i].name}`);
      setUploadPct(Math.round((i / files.length) * 100));
      const resized = await resizeImage(files[i]);
      const fd = new FormData();
      fd.append('file', resized);
      fd.append('shootId', String(shoot.id));
      if (selectedAlbumId) fd.append('albumId', selectedAlbumId);
      try {
        const result = await apiFetch('/api/upload', { method: 'POST', body: fd });
        current = { ...current, photos: [...current.photos, result.url] };
        if (selectedAlbumId) {
          currentAlbums = currentAlbums.map(a =>
            a.id === selectedAlbumId ? { ...a, photos: [...a.photos, result.url] } : a
          );
          current = { ...current, albums: currentAlbums };
          setAlbums(currentAlbums);
        }
        setShoot(current);
        onUpdated(current);
      } catch {
        alert(`Upload mislukt voor ${files[i].name}`);
      }
    }

    setUploadPct(100);
    setUploadText(`${files.length} foto${files.length !== 1 ? "'s" : ''} geüpload`);
    setTimeout(() => { setUploading(false); setUploadPct(0); }, 2000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function deletePhoto(url: string) {
    if (!confirm('Deze foto verwijderen?')) return;
    try {
      await apiFetch(`/api/shoots/${shoot.id}/photos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const nextAlbums = albums.map(a => ({
        ...a,
        photos: a.photos.filter(p => p !== url),
        coverPhoto: a.coverPhoto === url ? undefined : a.coverPhoto,
      }));
      const updated = { ...shoot, photos: shoot.photos.filter(p => p !== url), albums: nextAlbums };
      setAlbums(nextAlbums);
      setShoot(updated);
      onUpdated(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Verwijderen mislukt');
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(galleryUrl).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = galleryUrl;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  }

  const badge     = statusBadge(shoot);
  const photos    = shoot.photos ?? [];
  const selections = new Set(shoot.selections ?? []);
  const visiblePhotos = selectedAlbumId
    ? (albums.find(a => a.id === selectedAlbumId)?.photos ?? [])
    : photos;

  return (
    <div>
      <nav className="bg-velaro-surf1 border-b border-white/[0.08] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button className="btn-ghost" onClick={onBack}>← Dashboard</button>
          <span className="text-white/20">|</span>
          <Image src="/logo.png" alt="Velaro" width={140} height={32} />
          <span className="font-medium text-white">{shoot.name}</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-4">

        {/* Status */}
        <div className="card flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="label mb-1.5">Status</p>
            <span className={`badge ${badge.cls}`}>{badge.label}</span>
          </div>
          <div className="flex gap-2">
            {shoot.status !== 'klaar'
              ? <button className="btn-secondary text-sm" onClick={() => setKlaar(true)}>Markeer als Klaar</button>
              : <button className="btn-secondary text-sm" onClick={() => setKlaar(false)}>Status terugzetten</button>
            }
            <button className="btn-danger text-sm" onClick={deleteShoot}>Verwijderen</button>
          </div>
        </div>

        {/* Edit */}
        <div className="card">
          <h3 className="font-serif text-xl font-light mb-5">Gegevens bewerken</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="label">Naam shoot</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">Datum</label>
              <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>
          <div className="mb-3">
            <label className="label">Naam klant</label>
            <input className="input" value={clientName} onChange={e => setClientName(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="label">E-mail klant</label>
            <input className="input" type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
          </div>
          <div className="mb-5">
            <label className="label">Wachtwoord klant</label>
            <div className="flex gap-2">
              <input className="input flex-1" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" className="btn-secondary whitespace-nowrap" onClick={() => setPassword(generatePassword())}>Genereer</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-primary" onClick={saveDetails}>Opslaan</button>
            {editSaved && <span className="text-velaro-gold text-sm font-medium">✓ Opgeslagen</span>}
          </div>
        </div>

        {/* Gallery link */}
        <div className="card">
          <p className="label mb-3">Galerij-link voor klant</p>
          <div className="flex items-center gap-2 flex-wrap">
            <a href={galleryUrl} target="_blank" rel="noreferrer" className="text-velaro-gold text-sm hover:opacity-80 transition-opacity break-all">
              {galleryUrl}
            </a>
            <button className="btn-secondary text-xs px-2.5 py-1" onClick={copyLink}>Kopieer</button>
          </div>
        </div>

        {/* Upload */}
        <div className="card">
          <h3 className="font-serif text-xl font-light mb-4">Foto&apos;s uploaden</h3>
          <input ref={fileInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.webp,image/*" className="hidden" onChange={handleUpload} />
          <div className="flex items-center gap-3 flex-wrap">
            <button className="btn-primary" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
              Bladeren door bestanden
            </button>
            <span className="text-xs text-velaro-muted">
              JPG, PNG · meerdere bestanden tegelijk mogelijk
              {selectedAlbumId && ` · wordt toegevoegd aan map "${albums.find(a => a.id === selectedAlbumId)?.name}"`}
            </span>
          </div>
          {uploading && (
            <div className="mt-4">
              <p className="text-xs text-velaro-muted mb-2">{uploadText}</p>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${uploadPct}%`, background: 'linear-gradient(90deg, #D8BD71, #BEA256)' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Mappen + Photos */}
        <div className="flex flex-col md:flex-row gap-4">

          {/* Mappen sidebar */}
          <div className="card md:w-64 shrink-0">
            <h3 className="font-serif text-lg font-light mb-3">Mappen</h3>
            <div className="flex flex-col gap-1">
              <button
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-left transition-colors ${
                  selectedAlbumId === null ? 'bg-velaro-gold/15 text-velaro-gold' : 'hover:bg-white/5 text-white'
                }`}
                onClick={() => setSelectedAlbumId(null)}
              >
                <span className="flex-1">Alle foto&apos;s</span>
                <span className="text-xs text-velaro-muted">{photos.length}</span>
              </button>
              {albums.map(a => {
                const cover = a.coverPhoto ?? a.photos[0];
                return (
                  <div
                    key={a.id}
                    className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedAlbumId === a.id ? 'bg-velaro-gold/15 text-velaro-gold' : 'hover:bg-white/5 text-white'
                    }`}
                  >
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt="" className="w-7 h-7 rounded object-cover shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded bg-white/10 shrink-0" />
                    )}
                    {editingAlbumId === a.id ? (
                      <input
                        autoFocus
                        className="input flex-1 py-1 text-xs"
                        value={editingAlbumName}
                        onChange={e => setEditingAlbumName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') renameAlbum(a.id);
                          if (e.key === 'Escape') setEditingAlbumId(null);
                        }}
                        onBlur={() => renameAlbum(a.id)}
                      />
                    ) : (
                      <button
                        className="flex-1 text-left truncate"
                        onClick={() => setSelectedAlbumId(a.id)}
                        onDoubleClick={() => { setEditingAlbumId(a.id); setEditingAlbumName(a.name); }}
                        title="Dubbelklik om te hernoemen"
                      >
                        {a.name}
                      </button>
                    )}
                    <span className="text-xs text-velaro-muted">{a.photos.length}</span>
                    <button
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs transition-opacity leading-none"
                      title="Map verwijderen"
                      onClick={() => deleteAlbum(a.id)}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 mt-3">
              <input
                className="input flex-1 text-xs py-1.5"
                placeholder="Nieuwe map…"
                value={newAlbumName}
                onChange={e => setNewAlbumName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') createAlbum(); }}
              />
              <button className="btn-secondary text-xs px-2.5 whitespace-nowrap" onClick={createAlbum}>+ Map</button>
            </div>
          </div>

          {/* Photos */}
          <div className="card flex-1 min-w-0">
            <div className="mb-4">
              <h3 className="font-serif text-xl font-light">
                {selectedAlbumId ? albums.find(a => a.id === selectedAlbumId)?.name : "Foto's"} ({visiblePhotos.length})
              </h3>
              <p className="text-xs text-velaro-muted mt-1">
                {selections.size > 0 ? `${selections.size} foto's geselecteerd door klant (hele shoot)` : 'Nog geen selectie ontvangen.'}
              </p>
            </div>
            {visiblePhotos.length === 0 ? (
              <p className="text-velaro-muted text-sm">
                {selectedAlbumId ? "Nog geen foto's in deze map." : "Nog geen foto's geüpload."}
              </p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
                {visiblePhotos.map((url, i) => {
                  const sel = selections.has(url);
                  const canDelete = !shoot.selectionSubmitted && shoot.status !== 'klaar';
                  const activeAlbum = albums.find(a => a.id === selectedAlbumId);
                  const isCover = activeAlbum
                    ? (activeAlbum.coverPhoto ?? activeAlbum.photos[0]) === url
                    : false;
                  return (
                    <div key={url} className={`relative rounded-lg overflow-hidden border-2 ${sel ? 'border-velaro-gold' : 'border-white/[0.08]'}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Foto ${i + 1}`} className="w-full aspect-square object-cover block" />
                      {sel && (
                        <div className="absolute top-1.5 left-1.5 bg-velaro-gold text-velaro-bg text-xs font-semibold px-2 py-0.5 rounded-full">
                          ✓ {i + 1}
                        </div>
                      )}
                      {activeAlbum && (
                        <button
                          className={`absolute top-1.5 ${sel ? 'left-14' : 'left-1.5'} w-6 h-6 rounded-full flex items-center justify-center text-xs shadow ${
                            isCover ? 'bg-velaro-gold text-velaro-bg' : 'bg-black/60 text-white hover:bg-black/80'
                          }`}
                          title={isCover ? 'Omslagfoto van deze map' : 'Als omslagfoto instellen'}
                          onClick={() => setCover(activeAlbum.id, url)}
                        >
                          ★
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center leading-none shadow"
                          title="Foto verwijderen"
                          onClick={() => deletePhoto(url)}
                        >
                          ×
                        </button>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1.5 py-1 flex items-center gap-1">
                        <span className="flex-1 text-[11px] text-white truncate">
                          {(url.split('/').pop() ?? '').replace(/^\d+-/, '')}
                        </span>
                        <select
                          className="text-[10px] bg-white/10 text-white rounded px-1 py-0.5 border-0 outline-none max-w-[68px]"
                          value={albums.find(a => a.photos.includes(url))?.id ?? ''}
                          onChange={e => assignPhoto(url, e.target.value || null)}
                          title="Map toewijzen"
                        >
                          <option value="">Geen map</option>
                          {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
