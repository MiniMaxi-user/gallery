import { NextRequest, NextResponse } from 'next/server';
import { isPlatformAdminAuthenticatedFromRequest } from '@/lib/auth';
import { getPlatformData, savePlatformData } from '@/lib/data';
import type { PhotographerUser } from '@/lib/types';

export async function GET(req: NextRequest) {
  if (!isPlatformAdminAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await getPlatformData();
  return NextResponse.json({ photographers: data.photographers });
}

export async function POST(req: NextRequest) {
  if (!isPlatformAdminAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, email } = await req.json();

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Naam en e-mail zijn verplicht' }, { status: 400 });
  }

  const data = await getPlatformData();

  if (data.photographers.some(p => p.email.toLowerCase() === email.toLowerCase())) {
    return NextResponse.json({ error: 'E-mailadres al in gebruik' }, { status: 409 });
  }

  const photographer: PhotographerUser = {
    id:           crypto.randomUUID(),
    name:         name.trim(),
    email:        email.trim().toLowerCase(),
    registeredAt: new Date().toISOString(),
    isActive:     true,
  };

  data.photographers.push(photographer);
  await savePlatformData(data);

  return NextResponse.json({ photographer }, { status: 201 });
}
