import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { getShoot, updateShoot, deleteShoot } from '@/lib/data';
import { getAuthenticatedPhotographerIdFromRequest } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const shoot = await getShoot(Number(id));
    if (!shoot) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });

    // Gallery clients get shoot without password
    const { password: _, ...public_ } = shoot;
    return NextResponse.json(public_);
  } catch (err) {
    console.error('GET /api/shoots/[id] failed:', err);
    return NextResponse.json({ error: 'Kon shoot niet ophalen.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const photographerId = getAuthenticatedPhotographerIdFromRequest(req);
  if (!photographerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    const existing = await getShoot(Number(id));
    if (!existing || existing.photographerId !== photographerId) {
      return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    }

    const updated = await updateShoot(Number(id), body);
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PUT /api/shoots/[id] failed:', err);
    return NextResponse.json({ error: 'Opslaan mislukt. Probeer het opnieuw.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const photographerId = getAuthenticatedPhotographerIdFromRequest(req);
  if (!photographerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const shoot = await getShoot(Number(id));
    if (!shoot || shoot.photographerId !== photographerId) {
      return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    }

    // Delete all photos from Vercel Blob
    await Promise.allSettled(shoot.photos.map(url => del(url)));

    await deleteShoot(Number(id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/shoots/[id] failed:', err);
    return NextResponse.json({ error: 'Verwijderen mislukt. Probeer het opnieuw.' }, { status: 500 });
  }
}
