import type { Destination } from '@/types/destination.types';

export const getDestinationImage = (destination: Destination): string | null =>
  destination.images.find((image) => image.isPrimary)?.imageUrl
  ?? [...destination.images].sort((a, b) => a.displayOrder - b.displayOrder)[0]?.imageUrl
  ?? null;

export const formatTicketPrice = (value: string | number): string => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatVisitDuration = (minutes: number | null): string => {
  if (!minutes) return 'Thời gian linh hoạt';
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} giờ ${remainder} phút` : `${hours} giờ`;
};

export const getDirectionsUrl = (destination: Destination): string => {
  const coordinates = `${destination.latitude},${destination.longitude}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coordinates)}&destination_place_id=&travelmode=driving`;
};

export const getMapUrl = (destination: Destination): string => {
  const latitude = Number(destination.latitude);
  const longitude = Number(destination.longitude);
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
};
