import { NextRequest, NextResponse } from 'next/server';
import { isPlatformAdminAuthenticatedFromRequest } from '@/lib/auth';
import { getPlatformData, getData } from '@/lib/data';

export async function GET(req: NextRequest) {
  if (!isPlatformAdminAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [platformData, galleryData] = await Promise.all([getPlatformData(), getData()]);

    return NextResponse.json({
      totalPhotographers: platformData.photographers.length,
      activePhotographers: platformData.photographers.filter(p => p.isActive).length,
      totalGalleries: galleryData.shoots.length,
      totalPhotos: galleryData.shoots.reduce((sum, s) => sum + s.photos.length, 0),
    });
  } catch (err) {
    console.error('GET /api/admin/stats failed:', err);
    return NextResponse.json({ error: 'Kon statistieken niet ophalen.' }, { status: 500 });
  }
}
