import { ArrowUp, Mail, MapPin, Phone } from 'lucide-react';
import { CONTACT_INFO } from '../data/portfolioData';

interface FooterProps {
  onBackToTop: () => void;
}

export function Footer({ onBackToTop }: FooterProps) {
  return (
    <footer
      id="footer-contact"
      className="relative bg-[#fbf9ff] border-t border-purple-200/70 py-14 sm:py-16 px-4 sm:px-8"
    >
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#4c0b7b]">
            <span>{CONTACT_INFO.name}</span>
            <span aria-hidden="true" className="text-purple-300 font-normal">
              ·
            </span>
            <span className="font-editorial font-medium text-[#8e24aa]">
              Portfolio
            </span>
          </div>
          <p className="mt-2 text-sm text-[#5d4a75]">
            {CONTACT_INFO.subtitle}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#2b1b3d]">
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="inline-flex items-center gap-2 hover:text-[#8e24aa] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8e24aa] rounded-sm"
            >
              <Mail className="w-4 h-4 text-[#8e24aa] shrink-0" aria-hidden="true" />
              <span>{CONTACT_INFO.email}</span>
            </a>

            <a
              href={`tel:${CONTACT_INFO.phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 hover:text-[#8e24aa] transition-colors tabular-nums focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8e24aa] rounded-sm"
            >
              <Phone className="w-4 h-4 text-[#8e24aa] shrink-0" aria-hidden="true" />
              <span>{CONTACT_INFO.phone}</span>
            </a>

            <span className="inline-flex items-center gap-2 text-[#5d4a75]">
              <MapPin className="w-4 h-4 text-[#8e24aa] shrink-0" aria-hidden="true" />
              <span>{CONTACT_INFO.location}</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToTop}
          className="inline-flex items-center gap-2 px-5 min-h-[44px] text-sm font-semibold text-[#4c0b7b] bg-white hover:bg-[#f7f3ff] border border-purple-200 rounded-xl shadow-xs transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e24aa]"
        >
          <span>Back to top</span>
          <ArrowUp className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </footer>
  );
}
