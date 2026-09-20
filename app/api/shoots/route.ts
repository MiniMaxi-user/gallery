import { NextRequest, NextResponse } from 'next/server';
import { getShootsForPhotographer, createShoot } from '@/lib/data';
import { getAuthenticatedPhotographerIdFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const photographerId = getAuthenticatedPhotographerIdFromRequest(req);
  if (!photographerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const shoots = await getShootsForPhotographer(photographerId);
    return NextResponse.json({ shoots });
  } catch (err) {
    console.error('GET /api/shoots failed:', err);
    return NextResponse.json({ error: 'Kon shoots niet ophalen. Probeer het opnieuw.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const photographerId = getAuthenticatedPhotographerIdFromRequest(req);
  if (!photographerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, date, clientName, clientEmail, password } = body;

  if (!name || !clientName || !clientEmail || !password) {
    return NextResponse.json({ error: 'Verplichte velden ontbreken' }, { status: 400 });
  }

  try {
    const shoot = await createShoot(photographerId, { name, date: date ?? '', clientName, clientEmail, password });
    return NextResponse.json(shoot, { status: 201 });
  } catch (err) {
    console.error('POST /api/shoots failed:', err);
    return NextResponse.json({ error: 'Kon shoot niet aanmaken. Probeer het opnieuw.' }, { status: 500 });
  }
}
