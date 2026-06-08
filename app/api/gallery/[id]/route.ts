import { NextRequest, NextResponse } from 'next/server';
import { getData, saveData } from '@/lib/data';

type Params = { params: Promise<{ id: string }> };

// Validate gallery credentials and return shoot data (without password)
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { email, password } = await req.json();

  const data  = await getData();
  const shoot = data.shoots.find(s => s.id === Number(id));

  if (!shoot) return NextResponse.json({ error: 'Galerij niet gevonden' }, { status: 404 });

  const emailOk = email?.toLowerCase() === shoot.clientEmail.toLowerCase();
  const passOk  = password === shoot.password;

  if (!emailOk || !passOk) {
    return NextResponse.json({ error: 'Onjuist e-mailadres of wachtwoord' }, { status: 401 });
  }

  const { password: _, ...shootPublic } = shoot;
  return NextResponse.json(shootPublic);
}

// Submit photo selection
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { selections } = await req.json();

  const data  = await getData();
  const idx   = data.shoots.findIndex(s => s.id === Number(id));
  if (idx < 0) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });

  data.shoots[idx].selections = selections;
  data.shoots[idx].selectionSubmitted = true;
  await saveData(data);

  return NextResponse.json({ success: true });
}
