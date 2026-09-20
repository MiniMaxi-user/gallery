import { NextRequest, NextResponse } from 'next/server';
import { isPlatformAdminAuthenticatedFromRequest } from '@/lib/auth';
import { getStats } from '@/lib/data';

export async function GET(req: NextRequest) {
  if (!isPlatformAdminAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stats = await getStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error('GET /api/admin/stats failed:', err);
    return NextResponse.json({ error: 'Kon statistieken niet ophalen.' }, { status: 500 });
  }
}
