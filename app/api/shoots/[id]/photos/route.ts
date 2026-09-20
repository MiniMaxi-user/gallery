import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { getData, saveData } from '@/lib/data';
import { isAdminAuthenticatedFromRequest } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isAdminAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: 'url ontbreekt' }, { status: 400 });

  const data = await getData();
  const idx = data.shoots.findIndex(s => s.id === Number(id));
  if (idx < 0) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });

  await del(url).catch(() => {});
  const shoot = data.shoots[idx];
  shoot.photos = shoot.photos.filter(p => p !== url);
  if (shoot.albums) {
    shoot.albums = shoot.albums.map(a => ({
      ...a,
      photos: a.photos.filter(p => p !== url),
      coverPhoto: a.coverPhoto === url ? undefined : a.coverPhoto,
    }));
  }
  await saveData(data);
  return NextResponse.json({ success: true });
}
