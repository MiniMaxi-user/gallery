import { NextRequest, NextResponse } from 'next/server';
import { getData, saveData, nextId } from '@/lib/data';
import { isAdminAuthenticatedFromRequest } from '@/lib/auth';
import type { Shoot } from '@/lib/types';

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await getData();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, date, clientName, clientEmail, password } = body;

  if (!name || !clientName || !clientEmail || !password) {
    return NextResponse.json({ error: 'Verplichte velden ontbreken' }, { status: 400 });
  }

  const data = await getData();
  const id = await nextId(data.shoots);

  const shoot: Shoot = {
    id,
    name,
    date: date ?? '',
    clientName,
    clientEmail,
    password,
    photos: [],
    selections: [],
  };

  data.shoots.unshift(shoot);
  await saveData(data);

  return NextResponse.json(shoot, { status: 201 });
}
