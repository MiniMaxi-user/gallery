import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { getData, saveData } from '@/lib/data';
import { isAdminAuthenticatedFromRequest } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const data = await getData();
  const shoot = data.shoots.find(s => s.id === Number(id));
  if (!shoot) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });

  // Gallery clients get shoot without password
  const { password: _, ...public_ } = shoot;
  return NextResponse.json(public_);
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!isAdminAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const data = await getData();
  const idx = data.shoots.findIndex(s => s.id === Number(id));
  if (idx < 0) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });

  data.shoots[idx] = { ...data.shoots[idx], ...body, id: Number(id) };
  await saveData(data);
  return NextResponse.json(data.shoots[idx]);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isAdminAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const data = await getData();
  const idx = data.shoots.findIndex(s => s.id === Number(id));
  if (idx < 0) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });

  const shoot = data.shoots[idx];
  // Delete all photos from Vercel Blob
  await Promise.allSettled(shoot.photos.map(url => del(url)));

  data.shoots.splice(idx, 1);
  await saveData(data);
  return NextResponse.json({ success: true });
}
