import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// ── Photographer session ───────────────────────────────────────────────────
// Cookie value is `${photographerId}.${hmac}` so a session both proves the
// user is logged in AND identifies which photographer, without a server-side
// session store. The HMAC prevents a photographer from forging another
// photographer's id into their own cookie.
const PHOTOGRAPHER_COOKIE = 'admin_session';

function sign(photographerId: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET ?? 'dev-secret';
  return createHmac('sha256', secret).update(photographerId).digest('hex');
}

function encodePhotographerSession(photographerId: string): string {
  return `${photographerId}.${sign(photographerId)}`;
}

function decodePhotographerSession(value: string | undefined): string | null {
  if (!value) return null;
  const dot = value.lastIndexOf('.');
  if (dot < 0) return null;
  const id  = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expected = sign(id);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return id;
}

const cookieOpts = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge:   60 * 60 * 24 * 7,
  path:     '/',
};

export async function createPhotographerSession(photographerId: string) {
  (await cookies()).set(PHOTOGRAPHER_COOKIE, encodePhotographerSession(photographerId), cookieOpts);
}

export async function getAuthenticatedPhotographerId(): Promise<string | null> {
  const store = await cookies();
  return decodePhotographerSession(store.get(PHOTOGRAPHER_COOKIE)?.value);
}

export function getAuthenticatedPhotographerIdFromRequest(req: NextRequest): string | null {
  return decodePhotographerSession(req.cookies.get(PHOTOGRAPHER_COOKIE)?.value);
}

// ── Platform admin session (unchanged — single admin, no per-user scoping) ──
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
    opts:  cookieOpts,
  };
}
