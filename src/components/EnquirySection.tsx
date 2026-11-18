import { EnquiryFormCard } from './EnquiryFormCard';

export function EnquirySection() {
  return (
    <section
      id="enquiry-section"
      aria-labelledby="enquiry-section-heading"
      className="relative w-full py-20 sm:py-24 px-4 sm:px-8 lg:px-14 bg-[#070a1c] overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-120px] left-[-120px] w-[380px] h-[380px] rounded-full bg-gradient-to-br from-[#a855f7]/30 to-[#38bdf8]/10 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-140px] right-[-100px] w-[420px] h-[420px] rounded-full bg-gradient-to-tl from-[#8b5cf6]/30 to-[#38bdf8]/20 blur-2xl"
      />

      <div className="relative z-10 max-w-[1060px] mx-auto">
        <div className="flex items-baseline justify-between gap-4 mb-5 px-1">
          <div className="flex items-baseline gap-3">
            <span className="text-xs font-semibold tracking-wider text-sky-300 tabular-nums">
              07
            </span>
            <span aria-hidden="true" className="text-indigo-400/50">
              /
            </span>
            <span className="text-sm sm:text-base font-semibold tracking-tight text-slate-100">
              Direct Client Enquiry
            </span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Instant email notification
          </span>
        </div>

        <EnquiryFormCard headingId="enquiry-section-heading" />
      </div>
    </section>
  );
}
