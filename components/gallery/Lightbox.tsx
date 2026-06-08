'use client';

import { useEffect } from 'react';

interface Props {
  photos:   string[];
  index:    number;
  selected: boolean;
  submitted: boolean;
  onClose:  () => void;
  onNav:    (dir: -1 | 1) => void;
  onToggle: () => void;
}

export default function Lightbox({ photos, index, selected, submitted, onClose, onNav, onToggle }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowLeft')   onNav(-1);
      if (e.key === 'ArrowRight')  onNav(1);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, onNav]);

  if (index < 0) return null;
  const url = photos[index];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/93 flex items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button
        className="fixed top-4 right-4 bg-white/15 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/28 transition-colors"
        onClick={onClose}
        title="Sluiten (Esc)"
      >
        ✕
      </button>

      {photos.length > 1 && (
        <>
          <button
            className="fixed left-2.5 top-1/2 -translate-y-1/2 bg-white/12 text-white text-3xl w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/26 transition-colors"
            onClick={() => onNav(-1)}
          >
            ‹
          </button>
          <button
            className="fixed right-2.5 top-1/2 -translate-y-1/2 bg-white/12 text-white text-3xl w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/26 transition-colors"
            onClick={() => onNav(1)}
          >
            ›
          </button>
        </>
      )}

      <div className="max-w-[calc(100vw-160px)] max-h-[calc(100vh-120px)] flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={`Foto ${index + 1}`}
          className="max-w-full max-h-[calc(100vh-120px)] rounded-md block"
          draggable={false}
          onContextMenu={e => e.preventDefault()}
        />
      </div>

      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-4 whitespace-nowrap z-10">
        <span className="text-white/65 text-sm">{index + 1} / {photos.length}</span>
        {!submitted && (
          <button
            onClick={onToggle}
            className={`px-6 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${
              selected
                ? 'bg-transparent text-emerald-300 border-emerald-300 hover:bg-emerald-300/12'
                : 'bg-sage text-white border-sage hover:bg-sage-hover hover:border-sage-hover'
            }`}
          >
            {selected ? 'Deselecteer' : 'Selecteer'}
          </button>
        )}
      </div>
    </div>
  );
}
