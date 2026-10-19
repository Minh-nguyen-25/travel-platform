import { HTTP_STATUS } from '../constants';
import { AppError } from './app-error';

export interface ScheduleStop {
  id: number;
  startTime: Date | null;
  endTime: Date | null;
  travelMode: string | null;
  destination: { latitude: { toString(): string }; longitude: { toString(): string }; visitDuration: number | null };
}
export interface ScheduleLeg { distanceKm: number; durationMinutes: number; source: 'OSRM' | 'ESTIMATE' }
const minutes = (date: Date) => date.getUTCHours() * 60 + date.getUTCMinutes();
const time = (value: number) => new Date(Date.UTC(1970, 0, 1, 0, value));

export function estimateLeg(from: ScheduleStop, to: ScheduleStop): ScheduleLeg {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const lat1 = Number(from.destination.latitude), lat2 = Number(to.destination.latitude);
  const deltaLat = radians(lat2 - lat1);
  const deltaLng = radians(Number(to.destination.longitude) - Number(from.destination.longitude));
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(deltaLng / 2) ** 2;
  const distanceKm = Math.round(6371 * 2 * Math.asin(Math.min(1, Math.sqrt(a))) * 1.3 * 100) / 100;
  const speed = to.travelMode === 'WALKING' ? 4.5 : to.travelMode === 'CYCLING' ? 15 : 30;
  return { distanceKm, durationMinutes: Math.ceil(distanceKm / speed * 60), source: 'ESTIMATE' };
}

export function buildSchedule(original: ScheduleStop[], ordered: ScheduleStop[], legs: ScheduleLeg[]) {
  // Keep the day's original departure time and each activity's visit duration.
  let cursor = original.find((item) => item.startTime)?.startTime;
  let nextStart = cursor ? minutes(cursor) : 8 * 60;
  return ordered.map((item, index) => {
    const leg = index === 0 ? null : legs[index - 1];
    if (index > 0 && !leg) throw new Error('Missing route leg');
    nextStart += leg?.durationMinutes ?? 0;
    const duration = item.startTime && item.endTime
      ? minutes(item.endTime) - minutes(item.startTime) : item.destination.visitDuration ?? 60;
    const end = nextStart + Math.max(1, duration);
    if (end >= 24 * 60) {
      throw new AppError('Lịch trình mới vượt quá 23:59. Hãy giảm thời lượng hoặc số điểm dừng.', HTTP_STATUS.UNPROCESSABLE);
    }
    if (leg && leg.distanceKm > 9_999.99) {
      throw new AppError('Chặng di chuyển vượt quá giới hạn khoảng cách', HTTP_STATUS.UNPROCESSABLE);
    }
    const update = { id: item.id, startTime: time(nextStart), endTime: time(end),
      travelDistanceKm: leg?.distanceKm ?? null, travelDurationMinutes: leg?.durationMinutes ?? null,
      travelCalculationSource: leg?.source ?? null };
    nextStart = end;
    return update;
  });
}
