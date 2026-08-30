/**
 * TravelGoLogo — Reusable brand mark for TravelGo.
 *
 * Combines a stylized compass-route icon with the TravelGo wordmark and
 * optional "Hành trình Việt" tagline.
 *
 * Variants:
 *   - "light"  → white text + white icon (for dark/photo backgrounds)
 *   - "dark"   → teal icon + stone-900 text (for light form panels)
 */

export interface TravelGoLogoProps {
  /** Color scheme for the logo */
  variant?: 'light' | 'dark';
  /** Show the supporting tagline below the wordmark */
  showTagline?: boolean;
  /** Render only the icon mark (for compact/collapsed sidebars) */
  iconOnly?: boolean;
  /** CSS class applied to the root wrapper */
  className?: string;
}

export default function TravelGoLogo({
  variant = 'light',
  showTagline = true,
  iconOnly = false,
  className = '',
}: TravelGoLogoProps) {
  const isLight = variant === 'light';

  const iconBg = isLight ? 'bg-white/15 border-white/25' : 'bg-teal-50 border-teal-200/60';
  const iconColor = isLight ? 'text-white' : 'text-teal-700';
  const wordmarkColor = isLight ? 'text-white' : 'text-stone-900';
  const taglineColor = isLight ? 'text-teal-200' : 'text-teal-600';

  return (
    <div
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label="TravelGo — Nền tảng du lịch thông minh"
    >
      {/* ─── Icon Mark ─── */}
      <div
        className={`w-9 h-9 rounded-[11px] flex items-center justify-center border backdrop-blur-sm flex-shrink-0 ${iconBg}`}
        aria-hidden="true"
      >
        {/*
          Route-pin compass hybrid:
          - outer ring represents a globe / compass
          - inner dot-pin represents a destination location
          - arc paths represent a flight route between two points
        */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className={iconColor}
          aria-hidden="true"
        >
          {/* Compass outer ring — partial arc (open top-right to suggest motion) */}
          <path
            d="M10 2.5a7.5 7.5 0 1 1-5.303 2.197"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.55"
          />
          {/* Route path — arcing from lower-left to upper-right */}
          <path
            d="M4.5 14.5 Q7 8 14 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Origin dot */}
          <circle cx="4.5" cy="14.5" r="1.3" fill="currentColor" opacity="0.7" />
          {/* Destination pin head */}
          <circle cx="14" cy="5" r="2" fill="currentColor" />
          {/* Pin tail */}
          <path
            d="M14 7v2.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* ─── Wordmark + Tagline (Hidden if iconOnly) ─── */}
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span className={`text-[22px] font-bold tracking-tight ${wordmarkColor}`}>
            TravelGo
          </span>
          {showTagline && (
            <span
              className={`text-[9.5px] font-semibold tracking-[0.18em] uppercase mt-0.5 ${taglineColor}`}
            >
              Hành trình Việt
            </span>
          )}
        </div>
      )}
    </div>
  );
}
