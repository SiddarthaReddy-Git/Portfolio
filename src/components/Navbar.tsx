import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  activeSectionId: string;
  scrollProgress: number;
  onNavigate: (sectionId: string) => void;
  onOpenResume: () => void;
}

const TOP_LINKS = [
  { id: 'hero-slide', label: 'Hero' },
  { id: 'about-slide', label: 'About' },
  { id: 'skills-slide', label: 'Skills' },
  { id: 'projects-slide', label: 'Projects' },
  { id: 'education-slide', label: 'Education' },
];

export function Navbar({
  activeSectionId,
  scrollProgress,
  onNavigate,
  onOpenResume,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  const handleResumeClick = () => {
    setMobileMenuOpen(false);
    onOpenResume();
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/88 backdrop-blur-md border-b border-purple-200/50">
      {/* Scroll progress indicator */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-[2px] bg-[#8e24aa] origin-left transition-transform duration-75 ease-out"
        style={{ transform: `scaleX(${Math.min(1, Math.max(0, scrollProgress))})` }}
      />

      <div className="max-w-[1380px] mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('intro-video')}
          className="text-base sm:text-lg font-bold tracking-tight text-[#4c0b7b] hover:text-[#8e24aa] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8e24aa] rounded-sm"
        >
          Siddartha Reddy
        </button>

        {/* Zone 2: Concise single-line navigation links + Resume */}
        <nav
          aria-label="Portfolio sections"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[#5d4a75]"
        >
          {TOP_LINKS.map((link) => {
            const isActive = activeSectionId === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavClick(link.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8e24aa] rounded-sm ${
                  isActive
                    ? 'text-[#4c0b7b] font-semibold'
                    : 'text-[#5d4a75] hover:text-[#4c0b7b]'
                }`}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 right-0 -bottom-0.5 h-[1.5px] bg-[#8e24aa] transition-transform duration-200 origin-left ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleResumeClick}
            className="relative py-1 whitespace-nowrap shrink-0 cursor-pointer text-[#5d4a75] hover:text-[#4c0b7b] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8e24aa] rounded-sm"
          >
            Resume
          </button>
        </nav>

        {/* Zone 3: 1 primary action + mobile menu trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleNavClick('footer-contact')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#4c0b7b] hover:bg-[#6a15a8] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e24aa]"
          >
            Contact
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-[#4c0b7b] hover:bg-purple-50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#8e24aa]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile jump drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile portfolio sections"
          className="md:hidden bg-white/98 backdrop-blur-md border-b border-purple-200/60 px-4 py-3 flex flex-col gap-1"
        >
          {[
            { id: 'intro-video', label: '00 · Video Intro' },
            { id: 'hero-slide', label: '01 · Introduction' },
            { id: 'about-slide', label: '02 · About Me' },
            { id: 'skills-slide', label: '03 · Skills' },
            { id: 'projects-slide', label: '04 · Projects' },
            { id: 'education-slide', label: '05 · Education' },
            { id: 'achievements-slide', label: '06 · Achievements' },
            { id: 'footer-contact', label: 'Contact & Top' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-3 min-h-[44px] rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeSectionId === item.id
                  ? 'bg-[#f7f3ff] text-[#4c0b7b] font-semibold'
                  : 'text-[#5d4a75] hover:bg-purple-50/70 hover:text-[#4c0b7b]'
              }`}
            >
              {item.label}
            </button>
          ))}

          <button
            type="button"
            onClick={handleResumeClick}
            className="w-full text-left px-3 min-h-[44px] rounded-lg text-sm font-semibold text-[#4c0b7b] bg-[#f7f3ff]/80 hover:bg-[#f7f3ff] transition-colors cursor-pointer"
          >
            Resume (View & Download PDF)
          </button>
        </nav>
      )}
    </header>
  );
}
