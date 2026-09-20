import { NextRequest, NextResponse } from 'next/server';
import { getPhotographerByEmail } from '@/lib/data';
import { createPhotographerSession } from '@/lib/auth';

const SESSION_COOKIE = 'admin_session';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'E-mail en wachtwoord zijn verplicht' }, { status: 400 });
  }

  try {
    const photographer = await getPhotographerByEmail(email);

    if (!photographer || photographer.password !== password) {
      return NextResponse.json({ error: 'Onjuiste inloggegevens' }, { status: 401 });
    }

    if (!photographer.isActive) {
      return NextResponse.json({ error: 'Account is gedeactiveerd' }, { status: 403 });
    }

    await createPhotographerSession(photographer.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/auth failed:', err);
    return NextResponse.json({ error: 'Inloggen mislukt. Probeer het opnieuw.' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
