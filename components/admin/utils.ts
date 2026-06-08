import type { Shoot } from './types';

export function statusBadge(s: Shoot): { cls: string; label: string } {
  if (s.status === 'klaar')          return { cls: 'bg-green-100 text-green-800',  label: 'Klaar' };
  if (!s.photos || s.photos.length === 0) return { cls: 'bg-gray-100 text-gray-600',   label: "Geen foto's" };
  if (!s.selectionSubmitted)         return { cls: 'bg-orange-100 text-orange-700', label: 'Wacht op selectie' };
  return                                    { cls: 'bg-purple-100 text-purple-700', label: 'Selectie verzonden' };
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
