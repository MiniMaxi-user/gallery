import type { Shoot } from './types';

export function statusBadge(s: Shoot): { cls: string; label: string } {
  if (s.status === 'klaar')               return { cls: 'bg-green-500/15 text-green-300',    label: 'Klaar' };
  if (!s.photos || s.photos.length === 0) return { cls: 'bg-white/8 text-velaro-muted',      label: "Geen foto's" };
  if (!s.selectionSubmitted)              return { cls: 'bg-amber-400/15 text-amber-300',     label: 'Wacht op selectie' };
  return                                         { cls: 'bg-velaro-gold/15 text-velaro-gold', label: 'Selectie verzonden' };
}

export function formatDate(d: string): string {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}-${m}-${y}`;
}

export function generatePassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Verzoek mislukt');
  }
  return res.json();
}
