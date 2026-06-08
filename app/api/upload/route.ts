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
  await saveData(data);

  return NextResponse.json({ url: blob.url });
}
