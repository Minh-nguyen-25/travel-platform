import { useEffect, useMemo, useState } from 'react';
import TripIcon from '@/components/trip/TripIcon';
import type { DestinationImage } from '@/types/destination.types';

interface DestinationGalleryProps {
  destinationName: string;
  images: DestinationImage[];
}

export default function DestinationGallery({ destinationName, images }: DestinationGalleryProps) {
  const orderedImages = useMemo(
    () => [...images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.displayOrder - b.displayOrder),
    [images],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const selectedImage = orderedImages[selectedIndex];

  useEffect(() => {
    setSelectedIndex(0);
  }, [images]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (event.key === 'ArrowLeft') {
        setSelectedIndex((current) => (current - 1 + orderedImages.length) % orderedImages.length);
      }
      if (event.key === 'ArrowRight') {
        setSelectedIndex((current) => (current + 1) % orderedImages.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxOpen, orderedImages.length]);

  if (!selectedImage) {
    return (
      <div className="flex aspect-[16/8] items-center justify-center rounded-3xl bg-gradient-to-br from-primary-100 via-primary-50 to-accent-50 text-primary-300">
        <div className="text-center">
          <TripIcon name="image" size={52} strokeWidth={1.4} className="mx-auto" />
          <p className="mt-3 text-sm font-bold text-primary-500">Địa điểm chưa có ảnh</p>
        </div>
      </div>
    );
  }

  const selectPrevious = () => {
    setSelectedIndex((current) => (current - 1 + orderedImages.length) % orderedImages.length);
  };
  const selectNext = () => {
    setSelectedIndex((current) => (current + 1) % orderedImages.length);
  };

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_8rem]">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="group relative aspect-[16/9] overflow-hidden rounded-3xl bg-gray-100 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 lg:aspect-[16/8]"
          aria-label={`Mở ảnh ${selectedIndex + 1} của ${destinationName}`}
        >
          <img
            src={selectedImage.imageUrl}
            alt={`${destinationName} - ảnh ${selectedIndex + 1}`}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
          />
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-white/40 bg-gray-900/70 px-3 py-2 text-xs font-bold text-white backdrop-blur">
            <TripIcon name="image" size={14} />
            {selectedIndex + 1}/{orderedImages.length}
          </span>
        </button>

        {orderedImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 lg:max-h-[31rem] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pr-1">
            {orderedImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`relative aspect-square w-20 flex-none overflow-hidden rounded-2xl border-2 bg-gray-100 transition lg:w-full ${
                  selectedIndex === index
                    ? 'border-primary-500 ring-2 ring-primary-100'
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
                aria-label={`Chọn ảnh ${index + 1}`}
                aria-pressed={selectedIndex === index}
              >
                <img src={image.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-950/95 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Bộ ảnh ${destinationName}`}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
            aria-label="Đóng bộ ảnh"
          >
            <TripIcon name="x" size={22} />
          </button>
          {orderedImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={selectPrevious}
                className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
                aria-label="Ảnh trước"
              >
                <TripIcon name="chevron-left" size={24} />
              </button>
              <button
                type="button"
                onClick={selectNext}
                className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
                aria-label="Ảnh tiếp theo"
              >
                <TripIcon name="chevron-right" size={24} />
              </button>
            </>
          )}
          <div className="max-h-[86vh] max-w-[90vw] text-center">
            <img
              src={selectedImage.imageUrl}
              alt={`${destinationName} - ảnh ${selectedIndex + 1}`}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <p className="mt-4 text-sm font-semibold text-white/80">
              {selectedIndex + 1} / {orderedImages.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
