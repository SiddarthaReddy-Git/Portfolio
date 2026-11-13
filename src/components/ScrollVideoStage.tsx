import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, Pause, Play, Volume2 } from 'lucide-react';
import { VIDEO_ASSET } from '../data/portfolioData';
import { ParallaxBackdrop } from './ParallaxBackdrop';

gsap.registerPlugin(ScrollTrigger);

interface ScrollVideoStageProps {
  onSkipToSlides: () => void;
}

export function ScrollVideoStage({ onSkipToSlides }: ScrollVideoStageProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const framesRef = useRef<(HTMLImageElement | null)[]>(
    new Array(VIDEO_ASSET.totalFrames).fill(null)
  );
  const lastDrawnIndexRef = useRef<number>(-1);
  const isPlayingAudioRef = useRef<boolean>(false);
  const lastVideoSyncAtRef = useRef<number>(0);

  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    isPlayingAudioRef.current = isPlayingAudio;
  }, [isPlayingAudio]);

  // Detect reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Draw a frame (or nearest loaded frame) onto the 1280x720 canvas
  const drawFrameIndex = useCallback((targetIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const clamped = Math.max(0, Math.min(VIDEO_ASSET.totalFrames - 1, targetIdx));
    let drawnIdx = clamped;
    let img = framesRef.current[clamped];

    // If exact frame isn't loaded yet, pick closest available frame so scrubbing never stalls
    if (!img) {
      for (let offset = 1; offset < VIDEO_ASSET.totalFrames; offset++) {
        const before = clamped - offset;
        const after = clamped + offset;
        if (before >= 0 && framesRef.current[before]) {
          img = framesRef.current[before];
          drawnIdx = before;
          break;
        }
        if (after < VIDEO_ASSET.totalFrames && framesRef.current[after]) {
          img = framesRef.current[after];
          drawnIdx = after;
          break;
        }
      }
    }

    if (img && img.complete && img.naturalWidth > 0) {
      if (lastDrawnIndexRef.current !== drawnIdx) {
        ctx.drawImage(img, 0, 0, VIDEO_ASSET.width, VIDEO_ASSET.height);
        lastDrawnIndexRef.current = drawnIdx;
      }
    }
  }, []);

  // Progressive frame loader: Frame 0 first, then evenly distributed keyframes, then remaining frames
  useEffect(() => {
    let cancelled = false;
    const isMobile = window.innerWidth < 768;
    const step = isMobile ? 2 : 1; // Half frame density on mobile to reduce memory & bandwidth

    const loadSingleFrame = (idx: number): Promise<boolean> => {
      return new Promise((resolve) => {
        if (cancelled || framesRef.current[idx]) {
          resolve(true);
          return;
        }
        const img = new Image();
        img.decoding = 'async';
        img.src = VIDEO_ASSET.framePattern(idx);
        img.onload = () => {
          if (cancelled) return;
          framesRef.current[idx] = img;
          if (idx === 0) {
            drawFrameIndex(0);
            setIsReady(true);
          }
          resolve(true);
        };
        img.onerror = () => {
          resolve(false);
        };
      });
    };

    const preloadFrames = async () => {
      const firstOk = await loadSingleFrame(0);
      if (cancelled) return;

      // Priority pass: every 12th frame (~0.5s intervals) so immediate scrubbing works smoothly
      const priorityIndices: number[] = [];
      const remainingIndices: number[] = [];
      for (let i = step; i < VIDEO_ASSET.totalFrames; i += step) {
        if (i % 12 === 0) {
          priorityIndices.push(i);
        } else {
          remainingIndices.push(i);
        }
      }

      const loadInBatches = async (indices: number[], batchSize: number) => {
        for (let i = 0; i < indices.length; i += batchSize) {
          if (cancelled) return;
          const batch = indices.slice(i, i + batchSize);
          await Promise.all(batch.map((idx) => loadSingleFrame(idx)));
        }
      };

      await loadInBatches(priorityIndices, 8);
      await loadInBatches(remainingIndices, 10);

      if (!firstOk && !videoRef.current?.readyState) {
        setHasError(true);
      }
    };

    preloadFrames();

    return () => {
      cancelled = true;
    };
  }, [drawFrameIndex]);

  // GSAP ScrollTrigger scroll-driven video frame progression & parallax
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion) return;

    const scrubProxy = { progress: 0 };

    const ctx = gsap.context(() => {
      // Main video scrub tween
      gsap.to(scrubProxy, {
        progress: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.18,
          invalidateOnRefresh: true,
          onUpdate: () => {
            const p = scrubProxy.progress;

            // If user scrolls while audio playback is active, return control to scroll
            if (isPlayingAudioRef.current && videoRef.current && !videoRef.current.paused) {
              videoRef.current.pause();
              setIsPlayingAudio(false);
            }

            const targetIdx = Math.min(
              VIDEO_ASSET.totalFrames - 1,
              Math.max(0, Math.round(p * (VIDEO_ASSET.totalFrames - 1)))
            );
            drawFrameIndex(targetIdx);
            setProgress(p);

            // Sync underlying <video> currentTime cleanly (throttled to prevent H.264 decode stalls)
            const video = videoRef.current;
            const now = performance.now();
            if (
              video &&
              !isPlayingAudioRef.current &&
              video.readyState >= 2 &&
              !video.seeking &&
              now - lastVideoSyncAtRef.current > 180
            ) {
              const targetTime = p * VIDEO_ASSET.durationSeconds;
              if (Math.abs(video.currentTime - targetTime) > 0.15) {
                video.currentTime = targetTime;
                lastVideoSyncAtRef.current = now;
              }
            }

            // Subtle exit settle at the very end of the video runway (0.9 -> 1.0)
            if (frameWrapRef.current) {
              const exitProgress = p > 0.9 ? (p - 0.9) / 0.1 : 0;
              const scale = 1 - exitProgress * 0.03;
              const translateY = -exitProgress * 14;
              frameWrapRef.current.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
            }
          },
        },
      });

      // Parallax movement for background organic shapes inside the sticky intro
      const parallaxEls = section.querySelectorAll<HTMLElement>('.motion-parallax');
      parallaxEls.forEach((el) => {
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
  }, [drawFrameIndex, prefersReducedMotion]);

  const handleToggleAudioPlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlayingAudio) {
      video.pause();
      setIsPlayingAudio(false);
    } else {
      // Sync video start time to current scroll position (or restart if at end)
      const currentScrollTime = progress * VIDEO_ASSET.durationSeconds;
      video.currentTime = currentScrollTime >= 9.7 ? 0 : currentScrollTime;
      video.muted = false;
      video
        .play()
        .then(() => {
          setIsPlayingAudio(true);
        })
        .catch(() => {
          // Fallback if unmuted play is blocked
          video.muted = true;
          video.play().then(() => setIsPlayingAudio(true)).catch(() => {});
        });
    }
  };

  const currentSeconds = (progress * VIDEO_ASSET.durationSeconds).toFixed(1);

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
        <ParallaxBackdrop variant="video" />

        <div className="relative z-10 w-full max-w-[1140px] mx-auto flex flex-col items-center">
          {/* Quiet header strip above video */}
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

          {/* Centered 16:9 Video Stage */}
          <div
            ref={frameWrapRef}
            className="relative w-full aspect-video max-h-[70vh] rounded-xl sm:rounded-2xl overflow-hidden border border-purple-200/80 bg-[#f7f3ff] shadow-[0_28px_80px_-20px_rgba(76,11,123,0.20)] will-change-transform"
          >
            {/* Loading veil until first frame is ready */}
            {!isReady && !hasError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#f7f3ff] text-[#4c0b7b]">
                <div className="w-8 h-8 rounded-full border-2 border-purple-200 border-t-[#8e24aa] animate-spin" />
                <p className="text-xs font-medium text-[#5d4a75]">
                  Preparing introduction...
                </p>
              </div>
            )}

            {/* Graceful fallback using original first portfolio image if video fails */}
            {hasError ? (
              <img
                src={VIDEO_ASSET.poster}
                alt="Siddartha Reddy — Portfolio introduction fallback"
                className="w-full h-full object-contain bg-white"
              />
            ) : (
              <>
                {/* Actual supplied MP4 video (synced with scroll & used for audio playback) */}
                <video
                  ref={videoRef}
                  src={VIDEO_ASSET.src}
                  preload="auto"
                  playsInline
                  muted={!isPlayingAudio}
                  onLoadedData={() => {
                    if (videoRef.current && videoRef.current.currentTime === 0) {
                      setIsReady(true);
                    }
                  }}
                  onEnded={() => {
                    setIsPlayingAudio(false);
                  }}
                  onError={() => {
                    // Only trigger fallback if canvas frames also failed
                    if (!framesRef.current[0]) {
                      setHasError(true);
                    }
                  }}
                  className="w-full h-full object-contain bg-[#f7f3ff]"
                />

                {/* Smooth 60fps canvas renderer driven by extracted frames from the supplied MP4 */}
                <canvas
                  ref={canvasRef}
                  width={VIDEO_ASSET.width}
                  height={VIDEO_ASSET.height}
                  aria-hidden="true"
                  className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-150 ${
                    isPlayingAudio || prefersReducedMotion ? 'opacity-0' : 'opacity-100'
                  }`}
                />
              </>
            )}
          </div>

          {/* Minimal controls & timeline readout OUTSIDE the video frame */}
          <div className="w-full mt-3.5 sm:mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-3 min-w-[180px]">
              <span className="text-xs font-medium text-[#4c0b7b] tabular-nums w-[76px]">
                {currentSeconds}s / {VIDEO_ASSET.durationSeconds.toFixed(1)}s
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
                  onClick={handleToggleAudioPlayback}
                  aria-pressed={isPlayingAudio}
                  className="inline-flex items-center gap-2 px-3.5 min-h-[40px] text-xs font-semibold text-[#4c0b7b] bg-white hover:bg-[#f7f3ff] border border-purple-200/90 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e24aa]"
                >
                  {isPlayingAudio ? (
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

          {/* Scroll prompt indicator that fades out once scrolling starts */}
          {!prefersReducedMotion && (
            <div
              aria-hidden="true"
              className={`mt-3 flex flex-col items-center gap-1 text-[#5d4a75] transition-opacity duration-300 ${
                progress > 0.04 ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              <span className="text-xs font-medium tracking-tight">
                Scroll to animate
              </span>
              <ArrowDown className="w-3.5 h-3.5 text-[#8e24aa] animate-bounce" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
