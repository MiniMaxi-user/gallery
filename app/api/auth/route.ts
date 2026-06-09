import { NextRequest, NextResponse } from 'next/server';
import { getPlatformData } from '@/lib/data';

const SESSION_COOKIE = 'admin_session';
const SESSION_VALUE  = () => process.env.ADMIN_SESSION_SECRET ?? 'dev-secret';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'E-mail en wachtwoord zijn verplicht' }, { status: 400 });
  }

  const data = await getPlatformData();
  const photographer = data.photographers.find(
    p => p.email.toLowerCase() === email.toLowerCase() && p.password === password
  );

  if (!photographer) {
    return NextResponse.json({ error: 'Onjuiste inloggegevens' }, { status: 401 });
  }

  if (!photographer.isActive) {
    return NextResponse.json({ error: 'Account is gedeactiveerd' }, { status: 403 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, SESSION_VALUE(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
