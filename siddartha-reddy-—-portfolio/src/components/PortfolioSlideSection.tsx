import { useEffect, useRef, useState } from 'react';
import type { PortfolioSlide, SlideAvatar } from '../data/portfolio';
import { DecorativeOrbs } from './DecorativeOrbs';

function SlideAvatarCanvas({ avatar }: { avatar: SlideAvatar }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);
  const [fallbackImg, setFallbackImg] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.src = avatar.src;

    img.onload = () => {
      if (cancelled) return;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (!w || !h) {
        setFallbackImg(true);
        return;
      }

      const offscreen = document.createElement('canvas');
      offscreen.width = w;
      offscreen.height = h;
      const ctx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        setFallbackImg(true);
        return;
      }

      try {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        const isLavenderBg = (offset: number) => {
          const r = data[offset];
          const g = data[offset + 1];
          const b = data[offset + 2];
          return r >= 174 && g >= 164 && b >= 194 && b - r >= -3 && b - g >= 4;
        };

        const total = w * h;
        const visited = new Uint8Array(total);
        const masked = new Uint8Array(total);
        const queue = new Int32Array(total);
        let head = 0;
        let tail = 0;

        const enqueue = (x: number, y: number) => {
          const idx = y * w + x;
          if (!visited[idx]) {
            visited[idx] = 1;
            queue[tail++] = idx;
          }
        };

        for (let x = 0; x < w; x++) enqueue(x, 0);
        for (let y = 0; y < h; y++) {
          enqueue(0, y);
          enqueue(w - 1, y);
        }
        const leftEdge = Math.floor(w * 0.22);
        const rightEdge = Math.floor(w * 0.78);
        for (let x = 0; x < leftEdge; x++) enqueue(x, h - 1);
        for (let x = rightEdge; x < w; x++) enqueue(x, h - 1);

        while (head < tail) {
          const idx = queue[head++];
          if (!isLavenderBg(idx * 4)) continue;
          masked[idx] = 1;
          const x = idx % w;
          const y = (idx - x) / w;
          if (x + 1 < w) enqueue(x + 1, y);
          if (x - 1 >= 0) enqueue(x - 1, y);
          if (y + 1 < h) enqueue(x, y + 1);
          if (y - 1 >= 0) enqueue(x, y - 1);
        }

        let minX = w;
        let minY = h;
        let maxX = 0;
        let maxY = 0;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = y * w + x;
            const offset = idx * 4;
            if (masked[idx]) {
              data[offset + 3] = 0;
              continue;
            }
            let neighbors = 0;
            if (x > 0 && masked[idx - 1]) neighbors++;
            if (x + 1 < w && masked[idx + 1]) neighbors++;
            if (y > 0 && masked[idx - w]) neighbors++;
            if (y + 1 < h && masked[idx + w]) neighbors++;
            if (neighbors > 0) {
              const r = data[offset];
              const g = data[offset + 1];
              const b = data[offset + 2];
              const alphaScale = neighbors >= 3 ? 0.35 : neighbors === 2 ? 0.62 : 0.85;
              data[offset + 3] = Math.round(data[offset + 3] * alphaScale);
              if (b > g + 6 && r > 130) {
                data[offset + 2] = Math.min(b, Math.max(r, g) + 2);
              }
            }
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }

        if (maxX <= minX || maxY <= minY) {
          setFallbackImg(true);
          return;
        }

        ctx.putImageData(imageData, 0, 0);
        const cropW = maxX - minX + 1;
        const cropH = maxY - minY + 1;
        setDimensions({ w: cropW, h: cropH });

        requestAnimationFrame(() => {
          if (cancelled || !canvasRef.current) return;
          const target = canvasRef.current;
          target.width = cropW;
          target.height = cropH;
          const targetCtx = target.getContext('2d');
          if (targetCtx) {
            targetCtx.imageSmoothingEnabled = true;
            targetCtx.imageSmoothingQuality = 'high';
            targetCtx.clearRect(0, 0, cropW, cropH);
            targetCtx.drawImage(offscreen, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
          }
        });
      } catch {
        setFallbackImg(true);
      }
    };

    img.onerror = () => {
      if (!cancelled) setFallbackImg(true);
    };

    return () => {
      cancelled = true;
    };
  }, [avatar.src]);

  const style: React.CSSProperties = {
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

  if (fallbackImg) {
    return (
      <img
        src={avatar.src}
        alt={avatar.alt}
        draggable={false}
        referrerPolicy="no-referrer"
        style={style}
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
        ...style,
        aspectRatio: dimensions ? `${dimensions.w} / ${dimensions.h}` : undefined,
      }}
      className="pointer-events-none absolute h-auto select-none"
    />
  );
}

interface PortfolioSlideSectionProps {
  slide: PortfolioSlide;
  sectionIndex: number;
}

export function PortfolioSlideSection({ slide, sectionIndex }: PortfolioSlideSectionProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const isOdd = sectionIndex % 2 === 1;

  return (
    <section
      id={slide.id}
      aria-labelledby={`${slide.id}-heading`}
      className={`portfolio-slide-section relative min-h-[70vh] lg:min-h-screen w-full flex flex-col items-center justify-center px-4 sm:px-8 lg:px-14 py-16 sm:py-20 ${
        isOdd ? 'bg-lavender-grid-soft' : 'bg-lavender-grid'
      }`}
    >
      <DecorativeOrbs variant={isOdd ? 'slide-odd' : 'slide-even'} />

      <div className="relative z-10 w-full max-w-[1280px] mx-auto flex flex-col items-center">
        <div className="slide-reveal w-full flex items-baseline justify-between gap-4 mb-4 sm:mb-5 px-1">
          <div className="flex items-baseline gap-3">
            <span className="text-xs font-semibold tracking-wider text-[#8e24aa] tabular-nums">
              {slide.index}
            </span>
            <span aria-hidden="true" className="text-purple-300">
              /
            </span>
            <h2
              id={`${slide.id}-heading`}
              className="text-sm sm:text-base font-semibold tracking-tight text-[#4c0b7b]"
            >
              {slide.title}
            </h2>
          </div>
          <span className="text-xs text-[#5d4a75] hidden sm:inline tabular-nums">
            Slide {slide.index} of 06
          </span>
        </div>

        <div className="slide-reveal slide-frame-outer relative inline-flex items-center justify-center max-w-full rounded-xl sm:rounded-2xl overflow-hidden border border-purple-200/75 bg-white shadow-[0_24px_70px_-18px_rgba(76,11,123,0.16)]">
          {!loaded && !error && (
            <div aria-hidden="true" className="absolute inset-0 bg-[#f7f3ff] animate-pulse" />
          )}

          {error ? (
            <div className="px-8 py-16 text-center bg-[#f7f3ff] text-[#4c0b7b] min-w-[280px]">
              <p className="text-sm font-semibold">{slide.title}</p>
              <p className="text-xs text-[#5d4a75] mt-1">Unable to display slide image.</p>
            </div>
          ) : (
            <>
              <img
                src={slide.src}
                alt={slide.alt}
                loading={sectionIndex === 0 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
                referrerPolicy="no-referrer"
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
                style={{
                  aspectRatio: slide.aspectRatio,
                  maxHeight: '78vh',
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '100%',
                }}
                className="block object-contain select-none"
              />
              {loaded && slide.avatar && <SlideAvatarCanvas avatar={slide.avatar} />}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
