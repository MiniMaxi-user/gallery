import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getShoot, updateShoot } from '@/lib/data';
import { getAuthenticatedPhotographerIdFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const photographerId = getAuthenticatedPhotographerIdFromRequest(req);
  if (!photographerId) {
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

  try {
    const shoot = await getShoot(id);
    if (!shoot || shoot.photographerId !== photographerId) {
      return NextResponse.json({ error: 'Shoot niet gevonden' }, { status: 404 });
    }

    const blob = await put(`shoots/${id}/${Date.now()}-${file.name}`, file, {
      access: 'public',
    });

    const photos = shoot.photos.includes(blob.url) ? shoot.photos : [...shoot.photos, blob.url];
    let albums = shoot.albums ?? [];
    if (albumId) {
      albums = albums.map(a =>
        a.id === albumId && !a.photos.includes(blob.url)
          ? { ...a, photos: [...a.photos, blob.url] }
          : a
      );
    }

    await updateShoot(id, { photos, albums });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('POST /api/upload failed:', err);
    return NextResponse.json({ error: 'Upload mislukt. Probeer het opnieuw.' }, { status: 500 });
  }
}
