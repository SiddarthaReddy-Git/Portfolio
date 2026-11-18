interface DecorativeOrbsProps {
  variant: 'video' | 'slide-odd' | 'slide-even';
}

export function DecorativeOrbs({ variant }: DecorativeOrbsProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
      <svg
        viewBox="0 0 600 600"
        className={`motion-parallax absolute -top-24 -right-24 w-[420px] sm:w-[560px] h-auto opacity-55 ${
          variant === 'slide-odd' ? 'translate-y-4' : ''
        }`}
        data-parallax-speed="-14"
      >
        <defs>
          <radialGradient id={`lavGradA-${variant}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d8b4fe" stopOpacity="0.45" />
            <stop offset="65%" stopColor="#f3e8ff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="300" cy="300" r="280" fill={`url(#lavGradA-${variant})`} />
      </svg>

      <svg
        viewBox="0 0 500 500"
        className="motion-parallax absolute -bottom-28 -left-24 w-[360px] sm:w-[480px] h-auto opacity-50"
        data-parallax-speed="16"
      >
        <defs>
          <radialGradient id={`lavGradB-${variant}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e9d5ff" stopOpacity="0.48" />
            <stop offset="70%" stopColor="#f7f3ff" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          d="M362,84C422,126,458,204,444,282C430,360,366,438,284,458C202,478,102,440,58,366C14,292,26,182,82,118C138,54,202,52,290,26C302,42,362,84,362,84Z"
          fill={`url(#lavGradB-${variant})`}
        />
      </svg>

      <svg
        viewBox="0 0 24 24"
        className="motion-parallax hidden sm:block absolute top-[18%] left-[7%] w-5 h-5 text-[#d8b4fe]/70"
        data-parallax-speed="-24"
        fill="currentColor"
      >
        <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" />
      </svg>

      <svg
        viewBox="0 0 24 24"
        className="motion-parallax hidden sm:block absolute bottom-[22%] right-[8%] w-4 h-4 text-[#f5c77e]/65"
        data-parallax-speed="22"
        fill="currentColor"
      >
        <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" />
      </svg>
    </div>
  );
}
