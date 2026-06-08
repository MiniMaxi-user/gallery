import { Redis } from '@upstash/redis';
import type { AppData, Shoot } from './types';

const redis = Redis.fromEnv();
const KEY = 'gallery_data';

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
