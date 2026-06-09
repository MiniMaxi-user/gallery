'use client';

import { useEffect, useRef } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
  coverSquare?: boolean;
}

export default function WatermarkedImage({ src, alt, className, coverSquare }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    function render(img: HTMLImageElement) {
      if (cancelled || !canvas) return;
      if (!img.naturalWidth || !img.naturalHeight) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (coverSquare) {
        const size = Math.min(img.naturalWidth, img.naturalHeight);
        canvas.width = size;
        canvas.height = size;
        const sx = (img.naturalWidth - size) / 2;
        const sy = (img.naturalHeight - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
      } else {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
      }

      drawWatermark(ctx, canvas.width, canvas.height);
    }

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => render(img);
    img.onerror = () => {
      // Server doesn't support CORS preflight — retry without, canvas stays displayable
      const img2 = new window.Image();
      img2.onload = () => {
        try { render(img2); } catch { /* tainted canvas on strict CORS, silently skip */ }
      };
      img2.src = src;
    };
    img.src = src;

    return () => { cancelled = true; };
  }, [src, coverSquare]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-label={alt}
      onContextMenu={e => e.preventDefault()}
      style={{ display: 'block' }}
    />
  );
}

function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 10); // 18°

  // Scale font so 'SAMPLE' spans ~88% of image width
  let fontSize = w / 3;
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  const measured = ctx.measureText('SAMPLE').width;
  if (measured > 0) fontSize = (w * 0.88 * fontSize) / measured;

  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Dark stroke for contrast on light photos
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.lineWidth = Math.max(2, fontSize / 22);
  ctx.strokeText('SAMPLE', 0, 0);

  // White semi-transparent fill
  ctx.fillStyle = 'rgba(255, 255, 255, 0.40)';
  ctx.fillText('SAMPLE', 0, 0);

  ctx.restore();
}
