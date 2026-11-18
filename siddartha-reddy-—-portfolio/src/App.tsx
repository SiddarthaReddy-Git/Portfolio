import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUp } from 'lucide-react';
import { PORTFOLIO_SLIDES, QUICK_NAV_ITEMS } from './data/portfolio';
import { EnquiryModal } from './components/EnquiryModal';
import { EnquirySection } from './components/EnquirySection';
import { Footer } from './components/Footer';
import { IntroVideoSection } from './components/IntroVideoSection';
import { Navbar } from './components/Navbar';
import { PortfolioSlideSection } from './components/PortfolioSlideSection';
import { QuickNavDots } from './components/QuickNavDots';
import { ResumeModal } from './components/ResumeModal';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeSectionId, setActiveSectionId] = useState('intro-video');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const navigateToSection = useCallback((sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
    } else {
      gsap.to(window, {
        duration: 0.9,
        scrollTo: { y: target, autoKill: true },
        ease: 'power3.inOut',
      });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      gsap.to(window, {
        duration: 1,
        scrollTo: { y: 0, autoKill: true },
        ease: 'power3.inOut',
      });
    }
  }, []);

  useEffect(() => {
    const container = rootRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          setScrollProgress(self.progress);
          setShowBackToTop(self.scroll() > window.innerHeight * 1.15);
        },
      });

      QUICK_NAV_ITEMS.forEach(({ id }) => {
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

      if (!prefersReducedMotion) {
        container.querySelectorAll<HTMLElement>('.portfolio-slide-section').forEach((section) => {
          const reveals = section.querySelectorAll('.slide-reveal');
          gsap.fromTo(
            reveals,
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

          section.querySelectorAll<HTMLElement>('.motion-parallax').forEach((el) => {
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
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="min-h-screen bg-white text-[#2b1b3d]">
      <Navbar
        activeSectionId={activeSectionId}
        scrollProgress={scrollProgress}
        onNavigate={navigateToSection}
        onOpenResume={() => setResumeOpen(true)}
        onOpenEnquiry={() => setEnquiryOpen(true)}
      />

      <QuickNavDots activeSectionId={activeSectionId} onNavigate={navigateToSection} />

      <main>
        <IntroVideoSection onSkipToSlides={() => navigateToSection('hero-slide')} />

        {PORTFOLIO_SLIDES.map((slide, idx) => (
          <PortfolioSlideSection key={slide.id} slide={slide} sectionIndex={idx} />
        ))}

        <EnquirySection />
      </main>

      <Footer
        onBackToTop={scrollToTop}
        onOpenEnquiry={() => setEnquiryOpen(true)}
      />

      <ResumeModal isOpen={resumeOpen} onClose={() => setResumeOpen(false)} />
      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} />

      <button
        type="button"
        onClick={scrollToTop}
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
