import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, Pause, Play, Volume2 } from 'lucide-react';
import { INTRO_VIDEO } from '../data/portfolio';
import { DecorativeOrbs } from './DecorativeOrbs';

gsap.registerPlugin(ScrollTrigger);

interface IntroVideoSectionProps {
  onSkipToSlides: () => void;
}

export function IntroVideoSection({ onSkipToSlides }: IntroVideoSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>(
    Array(INTRO_VIDEO.totalFrames).fill(null)
  );
  const lastDrawnFrameRef = useRef(-1);
  const isPlayingRef = useRef(false);
  const lastVideoSyncRef = useRef(0);

  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const clamped = Math.max(0, Math.min(INTRO_VIDEO.totalFrames - 1, frameIndex));
    let chosenIndex = clamped;
    let img = framesRef.current[clamped];

    if (!img) {
      for (let offset = 1; offset < INTRO_VIDEO.totalFrames; offset++) {
        const prev = clamped - offset;
        const next = clamped + offset;
        if (prev >= 0 && framesRef.current[prev]) {
          img = framesRef.current[prev];
          chosenIndex = prev;
          break;
        }
        if (next < INTRO_VIDEO.totalFrames && framesRef.current[next]) {
          img = framesRef.current[next];
          chosenIndex = next;
          break;
        }
      }
    }

    if (img && img.complete && img.naturalWidth > 0 && lastDrawnFrameRef.current !== chosenIndex) {
      ctx.drawImage(img, 0, 0, INTRO_VIDEO.width, INTRO_VIDEO.height);
      lastDrawnFrameRef.current = chosenIndex;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const step = window.innerWidth < 768 ? 2 : 1;

    const loadFrame = (index: number) =>
      new Promise<boolean>((resolve) => {
        if (cancelled || framesRef.current[index]) {
          resolve(true);
          return;
        }
        const img = new Image();
        img.decoding = 'async';
        img.src = INTRO_VIDEO.framePattern(index);
        img.onload = () => {
          if (!cancelled) {
            framesRef.current[index] = img;
            if (index === 0) {
              drawFrame(0);
              setIsReady(true);
            }
            resolve(true);
          }
        };
        img.onerror = () => resolve(false);
      });

    (async () => {
      const firstOk = await loadFrame(0);
      if (cancelled) return;

      const keyframes: number[] = [];
      const rest: number[] = [];
      for (let i = step; i < INTRO_VIDEO.totalFrames; i += step) {
        if (i % 12 === 0) keyframes.push(i);
        else rest.push(i);
      }

      const loadBatch = async (indices: number[], batchSize: number) => {
        for (let i = 0; i < indices.length; i += batchSize) {
          if (cancelled) return;
          await Promise.all(indices.slice(i, i + batchSize).map((idx) => loadFrame(idx)));
        }
      };

      await loadBatch(keyframes, 8);
      await loadBatch(rest, 10);

      if (!firstOk && !videoRef.current?.readyState) {
        setHasError(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [drawFrame]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion) return;

    const state = { progress: 0 };
    const ctx = gsap.context(() => {
      gsap.to(state, {
        progress: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.18,
          invalidateOnRefresh: true,
          onUpdate: () => {
            const p = state.progress;
            if (isPlayingRef.current && videoRef.current && !videoRef.current.paused) {
              videoRef.current.pause();
              setIsPlaying(false);
            }

            const frameIndex = Math.min(
              INTRO_VIDEO.totalFrames - 1,
              Math.max(0, Math.round(p * (INTRO_VIDEO.totalFrames - 1)))
            );
            drawFrame(frameIndex);
            setProgress(p);

            const video = videoRef.current;
            const now = performance.now();
            if (
              video &&
              !isPlayingRef.current &&
              video.readyState >= 2 &&
              !video.seeking &&
              now - lastVideoSyncRef.current > 180
            ) {
              const targetTime = p * INTRO_VIDEO.durationSeconds;
              if (Math.abs(video.currentTime - targetTime) > 0.15) {
                video.currentTime = targetTime;
                lastVideoSyncRef.current = now;
              }
            }

            if (frameWrapRef.current) {
              const tail = p > 0.9 ? (p - 0.9) / 0.1 : 0;
              const scale = 1 - tail * 0.03;
              const y = -tail * 14;
              frameWrapRef.current.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
            }
          },
        },
      });

      section.querySelectorAll<HTMLElement>('.motion-parallax').forEach((el) => {
        const speed = Number(el.dataset.parallaxSpeed ?? '15');
        gsap.to(el, {
          yPercent: speed,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    }, section);

    return () => ctx.revert();
  }, [drawFrame, prefersReducedMotion]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      const targetTime = progress * INTRO_VIDEO.durationSeconds;
      video.currentTime = targetTime >= 9.7 ? 0 : targetTime;
      video.muted = false;
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          video.muted = true;
          video
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => {});
        });
    }
  };

  const formattedSeconds = (progress * INTRO_VIDEO.durationSeconds).toFixed(1);

  return (
    <section
      id="intro-video"
      ref={sectionRef}
      aria-label="Cinematic video introduction"
      className={`relative w-full bg-lavender-grid ${
        prefersReducedMotion ? 'min-h-screen' : 'h-[230vh] md:h-[380vh]'
      }`}
    >
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center px-4 sm:px-8 pt-14 pb-4 overflow-hidden">
        <DecorativeOrbs variant="video" />

        <div className="relative z-10 w-full max-w-[1140px] mx-auto flex flex-col items-center">
          <div className="w-full flex items-center justify-between gap-4 mb-3 sm:mb-4 px-1">
            <div className="flex items-baseline gap-2.5">
              <span className="text-xs font-semibold tracking-wider text-[#8e24aa] tabular-nums">
                00
              </span>
              <span aria-hidden="true" className="text-purple-300">
                /
              </span>
              <span className="text-xs sm:text-sm font-semibold tracking-tight text-[#4c0b7b]">
                Siddartha Reddy · Motion Introduction
              </span>
            </div>
            <span className="text-xs text-[#5d4a75] hidden sm:inline tabular-nums">
              {prefersReducedMotion ? 'Interactive player' : 'Scroll-driven · 24 fps'}
            </span>
          </div>

          <div
            ref={frameWrapRef}
            className="relative w-full aspect-video max-h-[70vh] rounded-xl sm:rounded-2xl overflow-hidden border border-purple-200/80 bg-[#f7f3ff] shadow-[0_28px_80px_-20px_rgba(76,11,123,0.20)] will-change-transform"
          >
            {!isReady && !hasError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#f7f3ff] text-[#4c0b7b]">
                <div className="w-8 h-8 rounded-full border-2 border-purple-200 border-t-[#8e24aa] animate-spin" />
                <p className="text-xs font-medium text-[#5d4a75]">Preparing introduction...</p>
              </div>
            )}

            {hasError ? (
              <img
                src={INTRO_VIDEO.poster}
                alt="Siddartha Reddy — Portfolio introduction fallback"
                className="w-full h-full object-contain bg-white"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={INTRO_VIDEO.src}
                  preload="auto"
                  playsInline
                  muted={!isPlaying}
                  onLoadedData={() => {
                    if (videoRef.current && videoRef.current.currentTime === 0) {
                      setIsReady(true);
                    }
                  }}
                  onEnded={() => setIsPlaying(false)}
                  onError={() => {
                    if (!framesRef.current[0]) {
                      setHasError(true);
                    }
                  }}
                  className="w-full h-full object-contain bg-[#f7f3ff]"
                />
                <canvas
                  ref={canvasRef}
                  width={INTRO_VIDEO.width}
                  height={INTRO_VIDEO.height}
                  aria-hidden="true"
                  className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-150 ${
                    isPlaying || prefersReducedMotion ? 'opacity-0' : 'opacity-100'
                  }`}
                />
              </>
            )}
          </div>

          <div className="w-full mt-3.5 sm:mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-3 min-w-[180px]">
              <span className="text-xs font-medium text-[#4c0b7b] tabular-nums w-[76px]">
                {formattedSeconds}s / {INTRO_VIDEO.durationSeconds.toFixed(1)}s
              </span>
              <div
                aria-hidden="true"
                className="w-24 sm:w-36 h-1 rounded-full bg-purple-100 overflow-hidden"
              >
                <div
                  className="h-full bg-[#8e24aa] origin-left"
                  style={{ transform: `scaleX(${Math.min(1, Math.max(0.02, progress))})` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {!hasError && (
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-pressed={isPlaying}
                  className="inline-flex items-center gap-2 px-3.5 min-h-[40px] text-xs font-semibold text-[#4c0b7b] bg-white hover:bg-[#f7f3ff] border border-purple-200/90 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e24aa]"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-[#8e24aa]" aria-hidden="true" />
                      <span>Pause video</span>
                    </>
                  ) : (
                    <>
                      {prefersReducedMotion ? (
                        <Play className="w-3.5 h-3.5 text-[#8e24aa]" aria-hidden="true" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-[#8e24aa]" aria-hidden="true" />
                      )}
                      <span>{prefersReducedMotion ? 'Play intro' : 'Play with audio'}</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={onSkipToSlides}
                className="inline-flex items-center gap-1.5 px-3.5 min-h-[40px] text-xs font-medium text-[#5d4a75] hover:text-[#4c0b7b] hover:bg-purple-50/70 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e24aa]"
              >
                <span>View slides</span>
                <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {!prefersReducedMotion && (
            <div
              aria-hidden="true"
              className={`mt-3 flex flex-col items-center gap-1 text-[#5d4a75] transition-opacity duration-300 ${
                progress > 0.04 ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              <span className="text-xs font-medium tracking-tight">Scroll to animate</span>
              <ArrowDown className="w-3.5 h-3.5 text-[#8e24aa] animate-bounce" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
