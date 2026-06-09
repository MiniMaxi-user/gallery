import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// ── Photographer session (unchanged) ──────────────────────────────────────────
const PHOTOGRAPHER_COOKIE = 'admin_session';
const photographerValue   = () => process.env.ADMIN_SESSION_SECRET ?? 'dev-secret';

export async function createAdminSession() {
  (await cookies()).set(PHOTOGRAPHER_COOKIE, photographerValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get(PHOTOGRAPHER_COOKIE)?.value === photographerValue();
}

export function isAdminAuthenticatedFromRequest(req: NextRequest): boolean {
  return req.cookies.get(PHOTOGRAPHER_COOKIE)?.value === photographerValue();
}

// ── Platform admin session ────────────────────────────────────────────────────
const PLATFORM_ADMIN_COOKIE = 'platform_admin_session';
const platformAdminValue    = () => `${process.env.ADMIN_SESSION_SECRET ?? 'dev-secret'}-admin`;

export async function isPlatformAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get(PLATFORM_ADMIN_COOKIE)?.value === platformAdminValue();
}

export function isPlatformAdminAuthenticatedFromRequest(req: NextRequest): boolean {
  return req.cookies.get(PLATFORM_ADMIN_COOKIE)?.value === platformAdminValue();
}

export function getPlatformAdminCookieConfig() {
  return {
    name:  PLATFORM_ADMIN_COOKIE,
    value: platformAdminValue(),
    opts: {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge:   60 * 60 * 24 * 7,
      path:     '/',
    },
  };
}
