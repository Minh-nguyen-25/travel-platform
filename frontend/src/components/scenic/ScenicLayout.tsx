import { useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import TripIcon from '@/components/trip/TripIcon';
import { ScenicContext } from '@/contexts/ScenicContext';
import { SCENIC_PHOTOS } from '@/data/scenic-photos';
import { resolveScenicThemes, selectScenicPhotos, type ScenicPhoto } from '@/utils/scenic-scene';
import './ScenicLayout.css';

function ScenicFrame({ photo, index }: { photo: ScenicPhoto; index: number }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className={`scenic-photo scenic-photo--${index % 3}${failed ? ' scenic-photo--fallback' : ''}`}>
      <span className="scenic-photo__fallback"><TripIcon name="compass" size={28} /><span>Hẹn một chuyến đi</span></span>
      {!failed && <img src={photo.src} alt="" width={photo.width ?? 480} height={photo.height ?? 360}
        loading="lazy" decoding="async" fetchPriority="low" onError={() => setFailed(true)} />}
      <figcaption><TripIcon name="map-pin" size={10} /><span>{photo.caption}</span></figcaption>
    </figure>
  );
}

export default function ScenicLayout({ children }: { children: ReactNode }) {
  const { pathname, search } = useLocation();
  const context = useContext(ScenicContext);
  const input = context?.input;
  const themes = useMemo(() => resolveScenicThemes(pathname, search, input?.categoryNames), [pathname, search, input?.categoryNames]);
  const photos = useMemo(() => selectScenicPhotos(SCENIC_PHOTOS, themes, input), [themes, input]);
  const stageRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(false);
  const [rows, setRows] = useState(6);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px)');
    const update = () => setWide(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!wide || !stageRef.current || !railRef.current) return undefined;
    const stage = stageRef.current;
    const rail = railRef.current;
    const update = () => {
      // Resize only, never scroll. Absolute rails cannot change the content height.
      const count = Math.ceil(stage.clientHeight / (rail.clientWidth * 1.08 + 30));
      setRows(Math.max(4, Math.min(32, count)));
    };
    update();
    if (!('ResizeObserver' in window)) return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [wide]);

  const quiet = /^\/(ai-chat|profile|preferences)(\/|$)/.test(pathname);
  return (
    <div ref={stageRef} className={`scenic-layout${pathname === '/' ? ' scenic-layout--home' : ''}${quiet ? ' scenic-layout--quiet' : ''}`} data-scenic-theme={themes.length > 1 ? 'mixed' : themes[0]}>
      {wide && <div className="scenic-rails" aria-hidden="true">
        {(['left', 'right'] as const).map((side, offset) => (
          <div key={side} ref={side === 'left' ? railRef : undefined} className={`scenic-rail scenic-rail--${side}`}>
            <span className="scenic-rail__eyebrow">{side === 'left' ? 'Đi & cảm nhận' : 'Muôn sắc Việt Nam'}</span>
            {Array.from({ length: rows }, (_, index) => {
              const photo = photos[(index * 2 + offset) % photos.length];
              return <ScenicFrame key={`${photo.src}-${index}`} photo={photo} index={index + offset} />;
            })}
          </div>
        ))}
      </div>}
      <div className="scenic-content">{children}</div>
    </div>
  );
}
