import { Redis } from '@upstash/redis';
import type { AppData, Shoot, PlatformData, PhotographerUser } from './types';

const redis = Redis.fromEnv();
const KEY          = 'gallery_data';
const PLATFORM_KEY = 'platform_data';

// ── Gallery data (unchanged) ──────────────────────────────────────────────────
export async function getData(): Promise<AppData> {
  const data = await redis.get<AppData>(KEY);
  return data ?? { shoots: [] };
}

export async function saveData(data: AppData): Promise<void> {
  await redis.set(KEY, data);
}

export async function getShoot(id: number): Promise<Shoot | undefined> {
  const data = await getData();
  return data.shoots.find(s => s.id === id);
}

export async function nextId(shoots: Shoot[]): Promise<number> {
  return shoots.length === 0 ? 1 : Math.max(...shoots.map(s => s.id)) + 1;
}

// ── Platform data ─────────────────────────────────────────────────────────────
export async function getPlatformData(): Promise<PlatformData> {
  const data = await redis.get<PlatformData>(PLATFORM_KEY);
  return data ?? { photographers: [] };
}

export async function savePlatformData(data: PlatformData): Promise<void> {
  await redis.set(PLATFORM_KEY, data);
}

export async function getPhotographer(id: string): Promise<PhotographerUser | undefined> {
  const data = await getPlatformData();
  return data.photographers.find(p => p.id === id);
}
