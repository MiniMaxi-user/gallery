import GalleryApp from '@/components/gallery/GalleryApp';

export const metadata = { title: 'Line Photography — Galerij' };

export default async function GalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GalleryApp shootId={id} />;
}
