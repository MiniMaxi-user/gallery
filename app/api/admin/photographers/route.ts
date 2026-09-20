import { NextRequest, NextResponse } from 'next/server';
import { isPlatformAdminAuthenticatedFromRequest } from '@/lib/auth';
import { getPhotographers, getPhotographerByEmail, createPhotographer } from '@/lib/data';

export async function GET(req: NextRequest) {
  if (!isPlatformAdminAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const photographers = await getPhotographers();
    return NextResponse.json({ photographers });
  } catch (err) {
    console.error('GET /api/admin/photographers failed:', err);
    return NextResponse.json({ error: 'Kon fotografen niet ophalen. Probeer het opnieuw.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isPlatformAdminAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, email, password } = await req.json();

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return NextResponse.json({ error: 'Naam, e-mail en wachtwoord zijn verplicht' }, { status: 400 });
  }

  try {
    const existing = await getPhotographerByEmail(email.trim());
    if (existing) {
      return NextResponse.json({ error: 'E-mailadres al in gebruik' }, { status: 409 });
    }

    const photographer = await createPhotographer({
      name:     name.trim(),
      email:    email.trim().toLowerCase(),
      password: password.trim(),
    });

    return NextResponse.json({ photographer }, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/photographers failed:', err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Kon fotograaf niet opslaan: ${detail}` }, { status: 500 });
  }
}
