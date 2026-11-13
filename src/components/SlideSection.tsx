import { useState } from 'react';
import { PortfolioSlide } from '../data/portfolioData';
import { ParallaxBackdrop } from './ParallaxBackdrop';
import { AvatarCutout } from './AvatarCutout';

interface SlideSectionProps {
  slide: PortfolioSlide;
  sectionIndex: number;
}

export function SlideSection({ slide, sectionIndex }: SlideSectionProps) {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const isOdd = sectionIndex % 2 === 1;

  return (
    <section
      id={slide.id}
      aria-labelledby={`${slide.id}-heading`}
      className={`portfolio-slide-section relative min-h-[70vh] lg:min-h-screen w-full flex flex-col items-center justify-center px-4 sm:px-8 lg:px-14 py-16 sm:py-20 ${
        isOdd ? 'bg-lavender-grid-soft' : 'bg-lavender-grid'
      }`}
    >
      <ParallaxBackdrop variant={isOdd ? 'slide-odd' : 'slide-even'} />

      <div className="relative z-10 w-full max-w-[1280px] mx-auto flex flex-col items-center">
        {/* Clean unboxed editorial section label outside the original image */}
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

        {/* Original unmodified slide presentation frame */}
        <div className="slide-reveal slide-frame-outer relative inline-flex items-center justify-center max-w-full rounded-xl sm:rounded-2xl overflow-hidden border border-purple-200/75 bg-white shadow-[0_24px_70px_-18px_rgba(76,11,123,0.16)]">
          {!loaded && !hasError && (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[#f7f3ff] animate-pulse"
            />
          )}

          {hasError ? (
            <div className="px-8 py-16 text-center bg-[#f7f3ff] text-[#4c0b7b] min-w-[280px]">
              <p className="text-sm font-semibold">{slide.title}</p>
              <p className="text-xs text-[#5d4a75] mt-1">
                Unable to display slide image.
              </p>
            </div>
          ) : (
            <>
              <img
                src={slide.src}
                alt={slide.alt}
                loading={sectionIndex === 0 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
                onLoad={() => setLoaded(true)}
                onError={() => setHasError(true)}
                style={{
                  aspectRatio: slide.aspectRatio,
                  maxHeight: '78vh',
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '100%',
                }}
                className="block object-contain select-none"
              />
              {loaded && slide.avatar && <AvatarCutout avatar={slide.avatar} />}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
