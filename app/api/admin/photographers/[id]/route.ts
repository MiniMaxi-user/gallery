import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { isPlatformAdminAuthenticatedFromRequest } from '@/lib/auth';
import { getPlatformData, savePlatformData, getData, saveData } from '@/lib/data';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!isPlatformAdminAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body   = await req.json();

  const data = await getPlatformData();
  const idx  = data.photographers.findIndex(p => p.id === id);

  if (idx === -1) {
    return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
  }

  if (typeof body.isActive === 'boolean') {
    data.photographers[idx].isActive = body.isActive;
  }

  await savePlatformData(data);
  return NextResponse.json({ photographer: data.photographers[idx] });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isPlatformAdminAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const platformData = await getPlatformData();
  if (!platformData.photographers.find(p => p.id === id)) {
    return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
  }

  // Delete all galleries and their photos from Blob storage
  const galleryData = await getData();
  await Promise.allSettled(
    galleryData.shoots.flatMap(s => s.photos.map(url => del(url)))
  );
  await saveData({ shoots: [] });

  platformData.photographers = platformData.photographers.filter(p => p.id !== id);
  await savePlatformData(platformData);

  return NextResponse.json({ success: true });
}
