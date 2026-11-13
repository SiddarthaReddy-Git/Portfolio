import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ArrowUp } from 'lucide-react';
import { NAV_SECTIONS, PORTFOLIO_SLIDES } from './data/portfolioData';
import { Navbar } from './components/Navbar';
import { ScrollVideoStage } from './components/ScrollVideoStage';
import { SlideSection } from './components/SlideSection';
import { SlideNavDots } from './components/SlideNavDots';
import { Footer } from './components/Footer';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function App() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>('intro-video');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  const navigateToSection = useCallback((sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
      return;
    }

    gsap.to(window, {
      duration: 0.9,
      scrollTo: { y: target, autoKill: true },
      ease: 'power3.inOut',
    });
  }, []);

  const handleBackToTop = useCallback(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    gsap.to(window, {
      duration: 1.0,
      scrollTo: { y: 0, autoKill: true },
      ease: 'power3.inOut',
    });
  }, []);

  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      // Global scroll progress & floating back-to-top visibility
      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          setScrollProgress(self.progress);
          setShowBackToTop(self.scroll() > window.innerHeight * 1.15);
        },
      });

      // Active section tracking for navbar & right-side navigation dots
      NAV_SECTIONS.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: 'top 52%',
          end: 'bottom 48%',
          onEnter: () => setActiveSectionId(id),
          onEnterBack: () => setActiveSectionId(id),
        });
      });

      if (!reducedMotion) {
        // Subtle entrance transitions on outer slide wrappers (never distorting image content)
        const slideSections = root.querySelectorAll<HTMLElement>('.portfolio-slide-section');
        slideSections.forEach((section) => {
          const revealItems = section.querySelectorAll<HTMLElement>('.slide-reveal');
          gsap.fromTo(
            revealItems,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              stagger: 0.08,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 78%',
                toggleActions: 'play none none reverse',
              },
            }
          );

          // Subtle parallax depth on surrounding lavender blobs
          const parallaxItems = section.querySelectorAll<HTMLElement>('.motion-parallax');
          parallaxItems.forEach((el) => {
            const speed = Number(el.dataset.parallaxSpeed ?? '12');
            gsap.to(el, {
              yPercent: speed,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            });
          });
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="min-h-screen bg-white text-[#2b1b3d]">
      <Navbar
        activeSectionId={activeSectionId}
        scrollProgress={scrollProgress}
        onNavigate={navigateToSection}
      />

      <SlideNavDots
        activeSectionId={activeSectionId}
        onNavigate={navigateToSection}
      />

      <main>
        {/* SECTION 1: Sticky-center scroll-driven video introduction */}
        <ScrollVideoStage onSkipToSlides={() => navigateToSection('hero-slide')} />

        {/* SECTIONS 2–7: Original unmodified portfolio slides in exact order */}
        {PORTFOLIO_SLIDES.map((slide, idx) => (
          <SlideSection key={slide.id} slide={slide} sectionIndex={idx} />
        ))}
      </main>

      {/* SECTION 8: Minimal footer */}
      <Footer onBackToTop={handleBackToTop} />

      {/* Floating Back-to-Top button */}
      <button
        type="button"
        onClick={handleBackToTop}
        aria-label="Back to top"
        className={`fixed bottom-5 right-5 z-30 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm border border-purple-200/90 text-[#4c0b7b] shadow-[0_10px_30px_-8px_rgba(76,11,123,0.28)] hover:bg-[#f7f3ff] hover:border-[#8e24aa]/50 transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e24aa] ${
          showBackToTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ArrowUp className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
