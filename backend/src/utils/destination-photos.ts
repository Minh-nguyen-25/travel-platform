import { z } from 'zod';
import { canonicalDestinationName } from './destination-name';

const photoSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(1),
  imageUrl: z.string(),
  sourceUrl: z.string().url().refine(value => {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'commons.wikimedia.org'
      && url.pathname.startsWith('/wiki/File:') && !url.username && !url.password;
  }),
  author: z.string().trim().min(1),
  license: z.string().regex(/^CC (BY|BY-SA) [234]\.0$|^CC0$/),
  licenseUrl: z.string().url().refine(value => new URL(value).hostname === 'creativecommons.org'),
}).refine(photo => photo.imageUrl === `/images/destinations/${photo.slug}.jpg`, 'Unexpected local image path');

export function parseDestinationPhotos(document: unknown) {
  const manifest = z.object({ retrievedAt: z.string().datetime(), photos: z.array(photoSchema).max(100) }).parse(document);
  if (new Set(manifest.photos.map(photo => canonicalDestinationName(photo.name))).size !== manifest.photos.length
    || new Set(manifest.photos.map(photo => photo.slug)).size !== manifest.photos.length) {
    throw new Error('Duplicate photo landmarks or file paths');
  }
  return manifest;
}

// Generic seed images are replaceable; admin and user uploads are not.
const legacySeedPhotos = new Set([
  'photo-1528127269322-539801943592', 'photo-1528181304800-259b08848526',
  'photo-1507525428034-b723cf961d3e', 'photo-1477959858617-67f85cf4f1df', 'photo-1552566626-52f8b828add9',
].map(id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`));
legacySeedPhotos.add('/images/destinations/placeholder.svg');

interface PhotoRecord { id: number; imageUrl: string; isPrimary: boolean; displayOrder: number }
interface DestinationRecord { id: number; name: string; images: PhotoRecord[] }
export function planDestinationPhotos(document: unknown, records: DestinationRecord[]) {
  const { photos } = parseDestinationPhotos(document);
  const operations: Array<{ destinationId: number; imageId?: number; imageUrl: string; isPrimary: boolean; displayOrder: number }> = [];
  const skipped: Array<{ name: string; reason: string }> = [];
  for (const photo of photos) {
    const matches = records.filter(record => canonicalDestinationName(record.name) === canonicalDestinationName(photo.name));
    if (matches.length !== 1) {
      skipped.push({ name: photo.name, reason: matches.length ? 'ambiguous-name' : 'not-in-database' });
      continue;
    }
    const destination = matches[0];
    const existingPhoto = destination.images.find(image => image.imageUrl === photo.imageUrl);
    const legacy = destination.images.find(image => image.isPrimary && legacySeedPhotos.has(image.imageUrl))
      ?? destination.images.find(image => legacySeedPhotos.has(image.imageUrl));
    if (existingPhoto) {
      if (legacy?.isPrimary && !existingPhoto.isPrimary) {
        operations.push({ destinationId: destination.id, imageId: legacy.id, imageUrl: legacy.imageUrl,
          isPrimary: false, displayOrder: legacy.displayOrder });
        operations.push({ destinationId: destination.id, imageId: existingPhoto.id, imageUrl: existingPhoto.imageUrl,
          isPrimary: true, displayOrder: existingPhoto.displayOrder });
      } else {
        skipped.push({ name: photo.name, reason: 'unchanged' });
      }
      continue;
    }
    operations.push(legacy ? {
      destinationId: destination.id, imageId: legacy.id, imageUrl: photo.imageUrl,
      isPrimary: legacy.isPrimary || !destination.images.some(image => image.isPrimary), displayOrder: legacy.displayOrder,
    } : {
      destinationId: destination.id, imageUrl: photo.imageUrl,
      isPrimary: !destination.images.some(image => image.isPrimary),
      displayOrder: destination.images.length ? Math.max(...destination.images.map(image => image.displayOrder)) + 1 : 0,
    });
  }
  return { operations, skipped };
}
