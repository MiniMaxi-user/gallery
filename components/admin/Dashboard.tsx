'use client';

import Image from 'next/image';
import type { Shoot } from './types';
import { statusBadge, formatDate } from './utils';

interface Props {
  shoots: Shoot[];
  onOpen:    (shoot: Shoot) => void;
  onNew:     () => void;
  onSettings: () => void;
  onLogout:  () => void;
}

export default function Dashboard({ shoots, onOpen, onNew, onSettings, onLogout }: Props) {
  return (
    <div>
      <nav className="bg-velaro-surf1 border-b border-white/[0.08] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Velaro" width={140} height={32} />
            <span className="text-[10px] text-velaro-muted tracking-widest uppercase">Beheer</span>
          </div>
          <div className="flex gap-3 items-center">
            <button className="btn-secondary text-xs px-3 py-1.5" onClick={onSettings}>Instellingen</button>
            <button className="btn-ghost text-xs" onClick={onLogout}>Uitloggen</button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-3xl font-light">Shoots</h1>
          <button className="btn-primary" onClick={onNew}>+ Nieuwe shoot</button>
        </div>

        {shoots.length === 0 ? (
          <div className="text-center py-16 text-velaro-muted">
            <p className="mb-2">Nog geen shoots.</p>
            <button className="text-velaro-gold underline text-sm hover:opacity-80 transition-opacity" onClick={onNew}>
              Maak je eerste shoot aan
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {shoots.map(s => {
              const b = statusBadge(s);
              return (
                <div
                  key={s.id}
                  className="bg-velaro-surf1 rounded-2xl border border-white/[0.08] p-5 cursor-pointer hover:border-white/[0.16] hover:bg-velaro-surf2 transition-all"
                  onClick={() => onOpen(s)}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-medium text-white text-lg">{s.name}</p>
                      <p className="text-xs text-velaro-muted mt-0.5">{s.clientName} · {s.clientEmail}</p>
                    </div>
                    <span className={`badge ${b.cls}`}>{b.label}</span>
                  </div>
                  <div className="flex gap-5 mt-3 text-xs text-velaro-muted">
                    <span>Datum: {formatDate(s.date)}</span>
                    <span>{s.photos.length} foto&apos;s</span>
                    <span>{s.selections.length} geselecteerd</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
