import { useEffect, useRef } from 'react';

/** One frame per scroll tick; no React renders during scrolling. */
export default function useHomeScrollMotion() {
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const hero = heroRef.current;
      const page = pageRef.current;
      if (!hero || !page) return;
      const bounds = hero.getBoundingClientRect();
      const offset = Math.max(0, Math.min(-bounds.top, bounds.height));
      // Keep translation within the image's 45px overdraw on stacked layouts.
      hero.style.setProperty('--hero-shift', preference.matches ? '0px' : `${Math.min(40, offset * 0.13)}px`);
      const pageBounds = page.getBoundingClientRect();
      const distance = Math.max(1, pageBounds.height - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -pageBounds.top / distance));
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    preference.addEventListener('change', schedule);
    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(schedule) : null;
    if (pageRef.current) resizeObserver?.observe(pageRef.current);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      preference.removeEventListener('change', schedule);
      resizeObserver?.disconnect();
    };
  }, []);

  return { pageRef, heroRef, progressRef };
}
