import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Album, Shoot, PhotographerUser } from './types';

let _client: SupabaseClient | null = null;

// Lazily created so importing this module never crashes `next build` before
// env vars are configured (e.g. first deploy before Marketplace provisioning).
function db(): SupabaseClient {
  if (!_client) {
    _client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return _client;
}

interface ShootRow {
  id: number;
  photographer_id: string;
  name: string;
  date: string | null;
  client_name: string;
  client_email: string;
  password: string;
  photos: string[];
  cover_photo: string | null;
  albums: Album[];
  selections: string[];
  selection_submitted: boolean;
  status: string | null;
}

interface PhotographerRow {
  id: string;
  name: string;
  email: string;
  password: string;
  registered_at: string;
  is_active: boolean;
}

function mapShoot(row: ShootRow): Shoot {
  return {
    id:                 row.id,
    photographerId:     row.photographer_id,
    name:               row.name,
    date:               row.date ?? '',
    clientName:         row.client_name,
    clientEmail:        row.client_email,
    password:           row.password,
    photos:             row.photos ?? [],
    coverPhoto:         row.cover_photo ?? undefined,
    albums:             row.albums ?? [],
    selections:         row.selections ?? [],
    selectionSubmitted: row.selection_submitted,
    status:             (row.status as 'klaar' | null) ?? undefined,
  };
}

function mapPhotographer(row: PhotographerRow): PhotographerUser {
  return {
    id:           row.id,
    name:         row.name,
    email:        row.email,
    password:     row.password,
    registeredAt: row.registered_at,
    isActive:     row.is_active,
  };
}

// ── Shoots ───────────────────────────────────────────────────────────────────

export async function getShootsForPhotographer(photographerId: string): Promise<Shoot[]> {
  const { data, error } = await db()
    .from('shoots')
    .select('*')
    .eq('photographer_id', photographerId)
    .order('id', { ascending: false });
  if (error) throw error;
  return (data as ShootRow[] ?? []).map(mapShoot);
}

export async function getShoot(id: number): Promise<Shoot | undefined> {
  const { data, error } = await db().from('shoots').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapShoot(data as ShootRow) : undefined;
}

export async function createShoot(photographerId: string, input: {
  name: string;
  date: string;
  clientName: string;
  clientEmail: string;
  password: string;
}): Promise<Shoot> {
  const { data, error } = await db()
    .from('shoots')
    .insert({
      photographer_id: photographerId,
      name:            input.name,
      date:            input.date || null,
      client_name:     input.clientName,
      client_email:    input.clientEmail,
      password:        input.password,
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapShoot(data as ShootRow);
}

export async function updateShoot(id: number, patch: Partial<{
  name: string;
  date: string;
  clientName: string;
  clientEmail: string;
  password: string;
  photos: string[];
  coverPhoto: string | null;
  albums: Album[];
  selections: string[];
  selectionSubmitted: boolean;
  status: string | null;
}>): Promise<Shoot | undefined> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined)               row.name                 = patch.name;
  if (patch.date !== undefined)                row.date                 = patch.date || null;
  if (patch.clientName !== undefined)          row.client_name          = patch.clientName;
  if (patch.clientEmail !== undefined)         row.client_email         = patch.clientEmail;
  if (patch.password !== undefined)            row.password             = patch.password;
  if (patch.photos !== undefined)              row.photos               = patch.photos;
  if (patch.coverPhoto !== undefined)          row.cover_photo          = patch.coverPhoto;
  if (patch.albums !== undefined)              row.albums               = patch.albums;
  if (patch.selections !== undefined)          row.selections           = patch.selections;
  if (patch.selectionSubmitted !== undefined)  row.selection_submitted  = patch.selectionSubmitted;
  if (patch.status !== undefined)              row.status               = patch.status;

  const { data, error } = await db().from('shoots').update(row).eq('id', id).select('*').maybeSingle();
  if (error) throw error;
  return data ? mapShoot(data as ShootRow) : undefined;
}

export async function deleteShoot(id: number): Promise<void> {
  const { error } = await db().from('shoots').delete().eq('id', id);
  if (error) throw error;
}

// ── Photographers ────────────────────────────────────────────────────────────

export async function getPhotographers(): Promise<PhotographerUser[]> {
  const { data, error } = await db().from('photographers').select('*').order('registered_at', { ascending: true });
  if (error) throw error;
  return (data as PhotographerRow[] ?? []).map(mapPhotographer);
}

export async function getPhotographerById(id: string): Promise<PhotographerUser | undefined> {
  const { data, error } = await db().from('photographers').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapPhotographer(data as PhotographerRow) : undefined;
}

export async function getPhotographerByEmail(email: string): Promise<PhotographerUser | undefined> {
  const { data, error } = await db().from('photographers').select('*').ilike('email', email).maybeSingle();
  if (error) throw error;
  return data ? mapPhotographer(data as PhotographerRow) : undefined;
}

export async function createPhotographer(input: {
  name: string;
  email: string;
  password: string;
}): Promise<PhotographerUser> {
  const { data, error } = await db()
    .from('photographers')
    .insert({ name: input.name, email: input.email, password: input.password })
    .select('*')
    .single();
  if (error) throw error;
  return mapPhotographer(data as PhotographerRow);
}

export async function updatePhotographer(id: string, patch: Partial<{ isActive: boolean }>): Promise<PhotographerUser | undefined> {
  const row: Record<string, unknown> = {};
  if (patch.isActive !== undefined) row.is_active = patch.isActive;

  const { data, error } = await db().from('photographers').update(row).eq('id', id).select('*').maybeSingle();
  if (error) throw error;
  return data ? mapPhotographer(data as PhotographerRow) : undefined;
}

export async function deletePhotographer(id: string): Promise<void> {
  const { error } = await db().from('photographers').delete().eq('id', id);
  if (error) throw error;
}

// ── Stats ────────────────────────────────────────────────────────────────────

export async function getStats() {
  const [totalRes, activeRes, shootsRes] = await Promise.all([
    db().from('photographers').select('*', { count: 'exact', head: true }),
    db().from('photographers').select('*', { count: 'exact', head: true }).eq('is_active', true),
    db().from('shoots').select('photos'),
  ]);
  if (totalRes.error) throw totalRes.error;
  if (activeRes.error) throw activeRes.error;
  if (shootsRes.error) throw shootsRes.error;

  const shoots = (shootsRes.data as { photos: string[] }[]) ?? [];
  return {
    totalPhotographers:  totalRes.count ?? 0,
    activePhotographers: activeRes.count ?? 0,
    totalGalleries:      shoots.length,
    totalPhotos:         shoots.reduce((sum, s) => sum + (s.photos?.length ?? 0), 0),
  };
}
