import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getData, saveData } from '@/lib/data';
import { isAdminAuthenticatedFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file    = formData.get('file') as File | null;
  const shootId = formData.get('shootId') as string | null;
  const albumId = formData.get('albumId') as string | null;

  if (!file || !shootId) {
    return NextResponse.json({ error: 'Bestand of shootId ontbreekt' }, { status: 400 });
  }

  const id = Number(shootId);
  const data = await getData();
  const idx  = data.shoots.findIndex(s => s.id === id);
  if (idx < 0) return NextResponse.json({ error: 'Shoot niet gevonden' }, { status: 404 });

  const blob = await put(`shoots/${id}/${Date.now()}-${file.name}`, file, {
    access: 'public',
  });

  if (!data.shoots[idx].photos.includes(blob.url)) {
    data.shoots[idx].photos.push(blob.url);
  }
  if (albumId) {
    const albums = data.shoots[idx].albums ?? [];
    const album  = albums.find(a => a.id === albumId);
    if (album && !album.photos.includes(blob.url)) {
      album.photos.push(blob.url);
    }
    data.shoots[idx].albums = albums;
  }
  await saveData(data);

  return NextResponse.json({ url: blob.url });
}
