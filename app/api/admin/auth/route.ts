import { NextRequest, NextResponse } from 'next/server';
import { getPlatformAdminCookieConfig } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const adminEmail    = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json({ error: 'Admin niet geconfigureerd' }, { status: 503 });
  }

  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json({ error: 'Onjuiste inloggegevens' }, { status: 401 });
  }

  const { name, value, opts } = getPlatformAdminCookieConfig();
  const res = NextResponse.json({ success: true });
  res.cookies.set(name, value, opts);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete('platform_admin_session');
  return res;
}
