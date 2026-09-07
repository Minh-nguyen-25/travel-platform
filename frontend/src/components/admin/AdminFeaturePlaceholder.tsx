import type { ReactNode } from 'react';

export interface AdminFeaturePlaceholderProps {
  /** Inline SVG icon representing the feature */
  icon: ReactNode;
  /** Page / feature title */
  title: string;
  /** Concise description of what this module will do */
  description: string;
  /** Feature owner as it already appears in the original page (kept verbatim) */
  owner?: string;
  /** Planned capabilities already defined by the project requirements */
  capabilities?: string[];
}

/**
 * AdminFeaturePlaceholder — Shared honest development placeholder for Admin
 * feature pages that are not yet implemented.
 *
 * Renders a premium-looking placeholder with no fake controls, no skeleton
 * rows and no fabricated data. All content must be accurate.
 */
export default function AdminFeaturePlaceholder({
  icon,
  title,
  description,
  owner,
  capabilities,
}: AdminFeaturePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 px-4">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Icon ring */}
        <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-50 to-stone-100 border border-line flex items-center justify-center shadow-sm">
          <span className="w-9 h-9 text-primary-600 flex items-center justify-center">
            {icon}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-stone-900 mb-2">{title}</h1>

        {/* Description */}
        <p className="text-sm text-stone-500 leading-relaxed mb-6">{description}</p>

        {/* Status badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Đang phát triển
        </span>

        {/* Owner — only if defined in original source */}
        {owner && (
          <p className="mt-3 text-xs text-stone-400">
            Feature owner:{' '}
            <span className="font-semibold text-stone-600">{owner}</span>
          </p>
        )}

        {/* Planned capabilities */}
        {capabilities && capabilities.length > 0 && (
          <div className="mt-8 text-left bg-white rounded-2xl border border-line shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-normal text-stone-400 mb-3">
              Tính năng dự kiến
            </p>
            <ul className="space-y-2">
              {capabilities.map((cap, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-stone-600">
                  <svg
                    className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {cap}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
