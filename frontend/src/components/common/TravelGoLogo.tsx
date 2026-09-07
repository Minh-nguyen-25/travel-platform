/**
 * TravelGoLogo — Reusable brand mark for TravelGo.
 *
 * Uses the official PNG logo (nón lá + location pin).
 * Wordmark "TravelGo" is rendered as HTML text beside the icon.
 *
 * Variants:
 *   - "light" → white wordmark (for dark/photo backgrounds)
 *   - "dark"  → stone-900 wordmark (for light backgrounds)
 */
import travelGoLogo from '@/assets/branding/travelgo-logo.png';

export interface TravelGoLogoProps {
  /** Color scheme for the wordmark */
  variant?: 'light' | 'dark';
  /** Show the "Hành trình Việt" tagline below the wordmark */
  showTagline?: boolean;
  /** Render only the icon mark — no wordmark (compact/collapsed sidebars) */
  iconOnly?: boolean;
  /** CSS class applied to the root wrapper */
  className?: string;
  /** Icon size in px (both width and height). Default: 40 */
  iconSize?: number;
}

export default function TravelGoLogo({
  variant = 'light',
  showTagline = false,
  iconOnly = false,
  className = '',
  iconSize = 40,
}: TravelGoLogoProps) {
  const isLight = variant === 'light';
  const wordmarkColor = isLight ? 'text-white' : 'text-stone-900';
  const taglineColor  = isLight ? 'text-teal-200' : 'text-teal-600';

  return (
    <div
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label="TravelGo — Nền tảng du lịch thông minh"
      role="img"
    >
      {/* ─── Logo image ─── */}
      <img
        src={travelGoLogo}
        alt="TravelGo logo"
        width={iconSize}
        height={iconSize}
        style={{ width: iconSize, height: iconSize, objectFit: 'contain', flexShrink: 0, display: 'block' }}
        aria-hidden="true"
      />

      {/* ─── Wordmark + optional tagline ─── */}
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span className={`text-[22px] font-bold tracking-normal leading-none whitespace-nowrap ${wordmarkColor}`}>
            TravelGo
          </span>
          {showTagline && (
            <span className={`mt-1 text-[9px] font-semibold tracking-normal uppercase whitespace-nowrap ${taglineColor}`}>
              Hành trình Việt
            </span>
          )}
        </div>
      )}
    </div>
  );
}
