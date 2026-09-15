import { z } from 'zod';
import { canonicalDestinationName } from './destination-name';

const mapDataSchema = z.object({
  fetchedAt: z.string().datetime(),
  destinations: z.array(z.object({
    name: z.string().trim().min(1).max(200),
    latitude: z.number().finite().min(8).max(24),
    longitude: z.number().finite().min(102).max(110),
    sourceUrl: z.string().url().refine(value => {
      const url = new URL(value);
      return url.protocol === 'https:' && url.hostname === 'www.wikidata.org'
        && !url.username && !url.password && url.pathname === '/w/index.php'
        && /^Q\d+$/.test(url.searchParams.get('title') || '')
        && /^\d+$/.test(url.searchParams.get('oldid') || '');
    }, 'A revision-specific Wikidata source URL is required'),
  }).strict()).max(300),
}).strict();

interface DestinationCoordinateRecord {
  id: number;
  name: string;
  latitude: string | number | { toString(): string };
  longitude: string | number | { toString(): string };
  coordinateSourceUrl?: string | null;
  coordinatesVerifiedAt?: Date | null;
}

export function coordinateIdentityChanged(input: { name?: string; latitude?: number; longitude?: number }, existing: Pick<DestinationCoordinateRecord, 'name' | 'latitude' | 'longitude'>): boolean {
  return (input.name !== undefined && input.name !== existing.name)
    || (input.latitude !== undefined && input.latitude.toFixed(7) !== Number(existing.latitude).toFixed(7))
    || (input.longitude !== undefined && input.longitude.toFixed(7) !== Number(existing.longitude).toFixed(7));
}

export function planVerifiedCoordinates(document: unknown, records: DestinationCoordinateRecord[], now = new Date()) {
  const data = mapDataSchema.parse(document);
  const coordinatesVerifiedAt = new Date(data.fetchedAt);
  if (coordinatesVerifiedAt > now) throw new Error('Map data cannot have a future verification date');
  if (new Set(data.destinations.map(item => canonicalDestinationName(item.name))).size !== data.destinations.length) {
    throw new Error('Map data contains duplicate destination names');
  }
  const updates: Array<{ id: number; latitude: number; longitude: number; coordinateSourceUrl: string; coordinatesVerifiedAt: Date }> = [];
  const skipped: Array<{ name: string; reason: string }> = [];
  for (const item of data.destinations) {
    const matches = records.filter(record => canonicalDestinationName(record.name) === canonicalDestinationName(item.name));
    if (matches.length !== 1) {
      skipped.push({ name: item.name, reason: matches.length ? 'ambiguous-name' : 'not-found' });
      continue;
    }
    const match = matches[0];
    if (match.coordinatesVerifiedAt && match.coordinatesVerifiedAt > coordinatesVerifiedAt) {
      skipped.push({ name: item.name, reason: 'newer-verification-exists' });
      continue;
    }
    if (!coordinateIdentityChanged(item, match) && match.coordinateSourceUrl === item.sourceUrl
      && match.coordinatesVerifiedAt?.getTime() === coordinatesVerifiedAt.getTime()) {
      skipped.push({ name: item.name, reason: 'unchanged' });
      continue;
    }
    const latitude = Number(match.latitude);
    const longitude = Number(match.longitude);
    const radians = Math.PI / 180;
    const a = Math.sin((latitude - item.latitude) * radians / 2) ** 2
      + Math.cos(latitude * radians) * Math.cos(item.latitude * radians)
      * Math.sin((longitude - item.longitude) * radians / 2) ** 2;
    const distanceMeters = 6_371_000 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
    if (!Number.isFinite(distanceMeters) || distanceMeters > 2000) {
      skipped.push({ name: item.name, reason: 'coordinates-too-far-apart' });
      continue;
    }
    updates.push({ id: match.id, latitude: item.latitude, longitude: item.longitude,
      coordinateSourceUrl: item.sourceUrl, coordinatesVerifiedAt });
  }
  return { updates, skipped };
}
