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
      <nav className="bg-white border-b border-warm-border px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Velaro" width={180} height={40} />
            <span className="text-xs text-warm-muted">Beheer</span>
          </div>
          <div className="flex gap-2 items-center">
            <button className="btn-secondary text-xs px-3 py-1.5" onClick={onSettings}>Instellingen</button>
            <button className="btn-ghost text-xs" onClick={onLogout}>Uitloggen</button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Shoots</h1>
          <button className="btn-primary" onClick={onNew}>+ Nieuwe shoot</button>
        </div>

        {shoots.length === 0 ? (
          <div className="text-center py-16 text-warm-muted">
            <p className="mb-2">Nog geen shoots.</p>
            <button className="text-sage underline text-sm" onClick={onNew}>Maak je eerste shoot aan</button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {shoots.map(s => {
              const b = statusBadge(s);
              return (
                <div
                  key={s.id}
                  className="bg-white rounded-xl border border-warm-border p-5 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onOpen(s)}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-lg">{s.name}</p>
                      <p className="text-xs text-warm-muted mt-0.5">{s.clientName} · {s.clientEmail}</p>
                    </div>
                    <span className={`badge ${b.cls}`}>{b.label}</span>
                  </div>
                  <div className="flex gap-5 mt-3 text-xs text-warm-muted">
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
