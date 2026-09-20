import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { getShoot, updateShoot } from '@/lib/data';
import { getAuthenticatedPhotographerIdFromRequest } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  const photographerId = getAuthenticatedPhotographerIdFromRequest(req);
  if (!photographerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: 'url ontbreekt' }, { status: 400 });

  try {
    const shoot = await getShoot(Number(id));
    if (!shoot || shoot.photographerId !== photographerId) {
      return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    }

    await del(url).catch(() => {});

    const photos = shoot.photos.filter(p => p !== url);
    const albums = (shoot.albums ?? []).map(a => ({
      ...a,
      photos: a.photos.filter(p => p !== url),
      coverPhoto: a.coverPhoto === url ? undefined : a.coverPhoto,
    }));

    await updateShoot(Number(id), { photos, albums });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/shoots/[id]/photos failed:', err);
    return NextResponse.json({ error: 'Verwijderen mislukt. Probeer het opnieuw.' }, { status: 500 });
  }
}
