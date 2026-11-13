import { NAV_SECTIONS } from '../data/portfolioData';

interface SlideNavDotsProps {
  activeSectionId: string;
  onNavigate: (sectionId: string) => void;
}

export function SlideNavDots({ activeSectionId, onNavigate }: SlideNavDotsProps) {
  return (
    <nav
      aria-label="Slide quick navigation"
      className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 z-30 flex-col items-end gap-2.5"
    >
      {NAV_SECTIONS.map((section) => {
        const isActive = activeSectionId === section.id;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onNavigate(section.id)}
            aria-label={`Jump to ${section.label}`}
            aria-current={isActive ? 'location' : undefined}
            className="group flex items-center gap-2.5 py-1 px-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e24aa] rounded-full"
          >
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-md bg-white/95 border border-purple-200/70 text-[#4c0b7b] shadow-sm transition-all duration-150 whitespace-nowrap ${
                isActive
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0'
              }`}
            >
              {section.label}
            </span>
            <span
              className={`block rounded-full transition-all duration-200 ${
                isActive
                  ? 'w-3 h-3 bg-[#4c0b7b] ring-4 ring-purple-200/80'
                  : 'w-2 h-2 bg-purple-300 group-hover:bg-[#8e24aa] group-hover:scale-125'
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
