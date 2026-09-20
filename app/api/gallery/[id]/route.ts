import { NextRequest, NextResponse } from 'next/server';
import { getShoot, updateShoot } from '@/lib/data';

type Params = { params: Promise<{ id: string }> };

// Validate gallery credentials and return shoot data (without password)
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { email, password } = await req.json();

  try {
    const shoot = await getShoot(Number(id));
    if (!shoot) return NextResponse.json({ error: 'Galerij niet gevonden' }, { status: 404 });

    const emailOk = email?.toLowerCase() === shoot.clientEmail.toLowerCase();
    const passOk  = password === shoot.password;

    if (!emailOk || !passOk) {
      return NextResponse.json({ error: 'Onjuist e-mailadres of wachtwoord' }, { status: 401 });
    }

    const { password: _, ...shootPublic } = shoot;
    return NextResponse.json(shootPublic);
  } catch (err) {
    console.error('POST /api/gallery/[id] failed:', err);
    return NextResponse.json({ error: 'Inloggen mislukt. Probeer het opnieuw.' }, { status: 500 });
  }
}

// Submit photo selection
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { selections } = await req.json();

  try {
    const existing = await getShoot(Number(id));
    if (!existing) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });

    await updateShoot(Number(id), { selections, selectionSubmitted: true });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PUT /api/gallery/[id] failed:', err);
    return NextResponse.json({ error: 'Opslaan mislukt. Probeer het opnieuw.' }, { status: 500 });
  }
}
