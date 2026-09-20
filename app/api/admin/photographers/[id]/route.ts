import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { isPlatformAdminAuthenticatedFromRequest } from '@/lib/auth';
import { getPhotographerById, updatePhotographer, deletePhotographer, getShootsForPhotographer } from '@/lib/data';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!isPlatformAdminAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body   = await req.json();

  try {
    const existing = await getPhotographerById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    }

    const photographer = await updatePhotographer(id, {
      isActive: typeof body.isActive === 'boolean' ? body.isActive : undefined,
    });

    return NextResponse.json({ photographer });
  } catch (err) {
    console.error('PATCH /api/admin/photographers/[id] failed:', err);
    return NextResponse.json({ error: 'Opslaan mislukt. Probeer het opnieuw.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isPlatformAdminAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const photographer = await getPhotographerById(id);
    if (!photographer) {
      return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    }

    // Delete only this photographer's shoots' photos from Blob storage —
    // the shoot rows themselves cascade-delete in the database.
    const shoots = await getShootsForPhotographer(id);
    await Promise.allSettled(shoots.flatMap(s => s.photos.map(url => del(url))));

    await deletePhotographer(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/photographers/[id] failed:', err);
    return NextResponse.json({ error: 'Verwijderen mislukt. Probeer het opnieuw.' }, { status: 500 });
  }
}
