import { useEffect, useRef, useState } from 'react';

export interface AvatarPlacement {
  src: string;
  alt: string;
  left?: string;
  right?: string;
  bottom: string;
  width: string;
  softBottomFade?: boolean;
}

interface AvatarCutoutProps {
  avatar: AvatarPlacement;
}

/**
 * Removes the exterior lavender grid background from the supplied avatar photo
 * using a border-seeded BFS flood-fill (preserving interior white clothing)
 * and crops tightly to the figure for seamless placement on the portfolio slide.
 */
export function AvatarCutout({ avatar }: AvatarCutoutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.decoding = 'async';
    img.src = avatar.src;

    img.onload = () => {
      if (cancelled) return;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (!w || !h) {
        setFallbackMode(true);
        return;
      }

      const workCanvas = document.createElement('canvas');
      workCanvas.width = w;
      workCanvas.height = h;
      const workCtx = workCanvas.getContext('2d', { willReadFrequently: true });
      if (!workCtx) {
        setFallbackMode(true);
        return;
      }

      workCtx.drawImage(img, 0, 0);
      const imageData = workCtx.getImageData(0, 0, w, h);
      const data = imageData.data;

      const isLavenderBg = (idx: number) => {
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        return r >= 174 && g >= 164 && b >= 194 && b - r >= -3 && b - g >= 4;
      };

      const total = w * h;
      const visited = new Uint8Array(total);
      const isBg = new Uint8Array(total);
      const queue = new Int32Array(total);
      let head = 0;
      let tail = 0;

      const pushSeed = (x: number, y: number) => {
        const p = y * w + x;
        if (!visited[p]) {
          visited[p] = 1;
          queue[tail++] = p;
        }
      };

      // Seed top edge, left edge, right edge, and outer bottom corners (avoiding center torso)
      for (let x = 0; x < w; x++) pushSeed(x, 0);
      for (let y = 0; y < h; y++) {
        pushSeed(0, y);
        pushSeed(w - 1, y);
      }
      const leftCornerEnd = Math.floor(w * 0.22);
      const rightCornerStart = Math.floor(w * 0.78);
      for (let x = 0; x < leftCornerEnd; x++) pushSeed(x, h - 1);
      for (let x = rightCornerStart; x < w; x++) pushSeed(x, h - 1);

      while (head < tail) {
        const p = queue[head++];
        if (!isLavenderBg(p * 4)) continue;
        isBg[p] = 1;

        const x = p % w;
        const y = (p - x) / w;

        if (x + 1 < w) pushSeed(x + 1, y);
        if (x - 1 >= 0) pushSeed(x - 1, y);
        if (y + 1 < h) pushSeed(x, y + 1);
        if (y - 1 >= 0) pushSeed(x, y - 1);
      }

      // Apply transparent background + 1px anti-aliased edge feathering & lavender defringe
      let minX = w;
      let minY = h;
      let maxX = 0;
      let maxY = 0;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const p = y * w + x;
          const idx = p * 4;

          if (isBg[p]) {
            data[idx + 3] = 0;
            continue;
          }

          // Count 4-connected background neighbors for smooth contour anti-aliasing
          let bgNeighbors = 0;
          if (x > 0 && isBg[p - 1]) bgNeighbors++;
          if (x + 1 < w && isBg[p + 1]) bgNeighbors++;
          if (y > 0 && isBg[p - w]) bgNeighbors++;
          if (y + 1 < h && isBg[p + w]) bgNeighbors++;

          if (bgNeighbors > 0) {
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            // Soften outer contour pixels and reduce lavender halo
            const alphaFactor = bgNeighbors >= 3 ? 0.35 : bgNeighbors === 2 ? 0.62 : 0.85;
            data[idx + 3] = Math.round(data[idx + 3] * alphaFactor);
            if (b > g + 6 && r > 130) {
              data[idx + 2] = Math.min(b, Math.max(r, g) + 2);
            }
          }

          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }

      if (maxX <= minX || maxY <= minY) {
        setFallbackMode(true);
        return;
      }

      workCtx.putImageData(imageData, 0, 0);

      const cropW = maxX - minX + 1;
      const cropH = maxY - minY + 1;
      setDimensions({ w: cropW, h: cropH });

      requestAnimationFrame(() => {
        if (cancelled || !canvasRef.current) return;
        const outCanvas = canvasRef.current;
        outCanvas.width = cropW;
        outCanvas.height = cropH;
        const outCtx = outCanvas.getContext('2d');
        if (!outCtx) return;
        outCtx.imageSmoothingEnabled = true;
        outCtx.imageSmoothingQuality = 'high';
        outCtx.clearRect(0, 0, cropW, cropH);
        outCtx.drawImage(workCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
      });
    };

    img.onerror = () => {
      if (!cancelled) setFallbackMode(true);
    };

    return () => {
      cancelled = true;
    };
  }, [avatar.src]);

  const positionStyle: React.CSSProperties = {
    left: avatar.left,
    right: avatar.right,
    bottom: avatar.bottom,
    width: avatar.width,
    ...(avatar.softBottomFade
      ? {
          maskImage: 'linear-gradient(to bottom, black 88%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 88%, transparent 100%)',
        }
      : {}),
  };

  if (fallbackMode) {
    return (
      <img
        src={avatar.src}
        alt={avatar.alt}
        draggable={false}
        style={positionStyle}
        className="pointer-events-none absolute h-auto object-contain select-none"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={avatar.alt}
      style={{
        ...positionStyle,
        aspectRatio: dimensions ? `${dimensions.w} / ${dimensions.h}` : undefined,
      }}
      className="pointer-events-none absolute h-auto select-none"
    />
  );
}
