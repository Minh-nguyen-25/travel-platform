import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: 'up' | 'left' | 'right' | 'scale';
}

export default function Reveal({
  children,
  className = '',
  delay = 0,
  variant = 'up',
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const mediaQuery = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

    if (!('IntersectionObserver' in window) || mediaQuery?.matches) {
      setIsVisible(true);
      return undefined;
    }

    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsVisible(true);
      }
    };

    if (mediaQuery) {
      mediaQuery.addEventListener('change', handleMotionChange);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (mediaQuery) {
        mediaQuery.removeEventListener('change', handleMotionChange);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal-section reveal-section--${variant} ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${Math.max(0, delay)}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
