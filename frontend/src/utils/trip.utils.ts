import axios from 'axios';
import type { TravelMode, TripStatus } from '@/types/trip.types';

const dateOnly = (value: string): Date => new Date(`${value.slice(0, 10)}T00:00:00.000Z`);

export const formatCurrency = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '0 ₫';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (
  value: string,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' },
): string => new Intl.DateTimeFormat('vi-VN', { ...options, timeZone: 'UTC' }).format(dateOnly(value));

export const formatShortDate = (value: string): string =>
  formatDate(value, { day: '2-digit', month: 'short' });

export const formatDateRange = (startDate: string, endDate: string): string => {
  if (startDate === endDate) {
    return formatDate(startDate, { day: '2-digit', month: 'long', year: 'numeric' });
  }
  const start = dateOnly(startDate);
  const end = dateOnly(endDate);
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();
  if (sameMonth) {
    const monthYear = formatDate(endDate, { month: 'long', year: 'numeric' });
    return `${start.getUTCDate().toString().padStart(2, '0')}–${end.getUTCDate().toString().padStart(2, '0')} ${monthYear}`;
  }
  if (sameYear) {
    return `${formatDate(startDate, { day: '2-digit', month: 'short' })} – ${formatDate(endDate, { day: '2-digit', month: 'short', year: 'numeric' })}`;
  }
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
};

export const formatTime = (value: string | null | undefined): string =>
  value ? value.slice(0, 5) : '';

export const getTripDuration = (startDate: string, endDate: string): number =>
  Math.max(1, Math.round((dateOnly(endDate).getTime() - dateOnly(startDate).getTime()) / 86_400_000) + 1);

export const getTripStatus = (
  tripOrStartDate: { startDate: string; endDate: string } | string,
  optionalEndDate?: string,
): TripStatus => {
  const startDate = typeof tripOrStartDate === 'string' ? tripOrStartDate : tripOrStartDate.startDate;
  const endDate = typeof tripOrStartDate === 'string' ? optionalEndDate ?? tripOrStartDate : tripOrStartDate.endDate;
  const today = new Date();
  const todayKey = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  if (todayKey < dateOnly(startDate)) return 'upcoming';
  if (todayKey > dateOnly(endDate)) return 'completed';
  return 'ongoing';
};

export const getTripStatusLabel = (status: TripStatus): string => ({
  upcoming: 'Sắp tới',
  ongoing: 'Đang diễn ra',
  completed: 'Đã kết thúc',
})[status];

export const getTravelModeLabel = (mode: TravelMode | null): string => {
  if (!mode) return 'Di chuyển';
  return ({
    WALKING: 'Đi bộ',
    DRIVING: 'Ô tô',
    TRANSIT: 'Phương tiện công cộng',
    CYCLING: 'Xe đạp',
  } as const)[mode];
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError(error)) return error instanceof Error && error.message ? error.message : fallback;
  const responseData = error.response?.data;
  if (typeof responseData === 'object' && responseData !== null) {
    const data = responseData as { message?: unknown; errors?: unknown };
    if (typeof data.message === 'string' && data.message && data.message !== 'Dữ liệu không hợp lệ') {
      return data.message;
    }
    if (typeof data.errors === 'object' && data.errors !== null) {
      const firstErrors = Object.values(data.errors as Record<string, unknown>)[0];
      if (Array.isArray(firstErrors) && typeof firstErrors[0] === 'string') return firstErrors[0];
    }
  }
  if (!error.response) return 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối và thử lại.';
  return fallback;
};
