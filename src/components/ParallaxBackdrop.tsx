interface ParallaxBackdropProps {
  variant?: 'video' | 'slide-even' | 'slide-odd';
}

export function ParallaxBackdrop({ variant = 'slide-even' }: ParallaxBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {/* Top-right soft organic lavender shape */}
      <svg
        viewBox="0 0 600 600"
        className={`motion-parallax absolute -top-24 -right-24 w-[420px] sm:w-[560px] h-auto opacity-55 ${
          variant === 'slide-odd' ? 'translate-y-4' : ''
        }`}
        data-parallax-speed={variant === 'video' ? '-18' : '-12'}
      >
        <defs>
          <radialGradient id={`lavGradA-${variant}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e9d8ff" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#f5edff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          d="M432,102C498,154,538,242,516,328C494,414,410,498,314,514C218,530,110,478,76,390C42,302,82,178,158,112C234,46,366,50,432,102Z"
          fill={`url(#lavGradA-${variant})`}
        />
      </svg>

      {/* Bottom-left soft organic lavender shape */}
      <svg
        viewBox="0 0 500 500"
        className="motion-parallax absolute -bottom-24 -left-24 w-[340px] sm:w-[480px] h-auto opacity-50"
        data-parallax-speed={variant === 'video' ? '20' : '14'}
      >
        <defs>
          <radialGradient id={`lavGradB-${variant}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#dcc2ff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#f5edff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          d="M362,84C422,126,458,214,432,292C406,370,318,438,224,442C130,446,30,386,26,294C22,202,114,78,202,52C290,26,302,42,362,84Z"
          fill={`url(#lavGradB-${variant})`}
        />
      </svg>

      {/* Subtle 4-point star accents matching the original slide motifs */}
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
