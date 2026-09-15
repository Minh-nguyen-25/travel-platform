import { z } from 'zod';

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
  if (new Set(manifest.photos.map(photo => photo.name)).size !== manifest.photos.length
    || new Set(manifest.photos.map(photo => photo.slug)).size !== manifest.photos.length) {
    throw new Error('Duplicate photo landmarks or file paths');
  }
  return manifest;
}

// ─── URL classification ────────────────────────────────────────────────────────

const CLOUDINARY_PREFIX = 'https://res.cloudinary.com/';
const PLACEHOLDER_URL = '/images/destinations/placeholder.svg';

// These are the five generic Unsplash images used by the original seed script,
// not photos uploaded by users or admins. Only these exact URLs are replaceable.
export const legacySeedPhotos = new Set([
  'photo-1528127269322-539801943592', 'photo-1528181304800-259b08848526',
  'photo-1507525428034-b723cf961d3e', 'photo-1477959858617-67f85cf4f1df', 'photo-1552566626-52f8b828add9',
].map(id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`));

export type ImageKind =
  | 'cloudinary'
  | 'placeholder'
  | 'legacy-seed'
  | 'local-destination'
  | 'other';

export function classifyUrl(url: string): ImageKind {
  if (url.startsWith(CLOUDINARY_PREFIX)) return 'cloudinary';
  if (url === PLACEHOLDER_URL) return 'placeholder';
  if (legacySeedPhotos.has(url)) return 'legacy-seed';
  if (url.startsWith('/images/destinations/')) return 'local-destination';
  return 'other';
}

// ─── Alias table ──────────────────────────────────────────────────────────────
// Maps the "name" field in destination-photos.json to the exact name stored in
// the database. Only one-to-one, unambiguous mappings are allowed here.
// If a JSON name matches a DB name directly, no alias is needed.
// Aliases were verified by querying the database (see docs/destination-photos.md).
export const NAME_ALIASES: Record<string, string> = {
  // JSON name                          → DB name (exact, verified unique)
  'Văn Miếu - Quốc Tử Giám':          'Văn Miếu – Quốc Tử Giám',  // hyphen vs en-dash
  'Hội An':                             'Phố cổ Hội An',             // DB uses full name
  // Hà Giang, Ninh Bình, Đà Lạt intentionally omitted:
  //   • Hà Giang  → no unambiguous single match in DB (closest: Cao nguyên đá Đồng Văn, Thị trấn Sa Pa)
  //   • Ninh Bình → DB has "Quần thể danh thắng Tràng An" and "Tam Cốc – Bích Động" — ambiguous
  //   • Đà Lạt    → DB has "Thành phố Đà Lạt" and "Hồ Xuân Hương" — ambiguous (2 destinations)
};

// ─── Planning types ───────────────────────────────────────────────────────────

export type OperationKind =
  | 'replace-placeholder'
  | 'replace-legacy-seed'
  | 'create-primary'
  | 'add-secondary-beside-cloudinary'
  | 'already-present';

export type SkipReason =
  | 'not-in-database'
  | 'ambiguous-name'
  | 'protected-existing-image';

export interface PlannedOperation {
  kind: OperationKind;
  destinationId: number;
  destinationName: string;
  /** Set when updating an existing image row. */
  imageId?: number;
  /** Current image URL being replaced or supplemented (undefined for create-primary). */
  currentUrl?: string;
  /** Classification of the current image. */
  currentKind?: ImageKind;
  /** The new local image URL. */
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
  reason: string;
}

export interface SkippedEntry {
  name: string;
  reason: SkipReason | 'already-present';
  detail?: string;
}

export interface PhotoPlan {
  operations: PlannedOperation[];
  skipped: SkippedEntry[];
}

// ─── Plan builder ─────────────────────────────────────────────────────────────

interface PhotoRecord { id: number; imageUrl: string; isPrimary: boolean; displayOrder: number }
interface DestinationRecord { id: number; name: string; images: PhotoRecord[] }

export function planDestinationPhotos(document: unknown, records: DestinationRecord[]): PhotoPlan {
  const { photos } = parseDestinationPhotos(document);
  const operations: PlannedOperation[] = [];
  const skipped: SkippedEntry[] = [];

  // Build lookup: resolved DB name → record (check for ambiguity at alias level too)
  const nameToRecord = new Map<string, DestinationRecord>();
  for (const record of records) {
    nameToRecord.set(record.name, record);
  }

  for (const photo of photos) {
    // Resolve DB name: direct match first, then alias table.
    const resolvedName = nameToRecord.has(photo.name)
      ? photo.name
      : (NAME_ALIASES[photo.name] ?? null);

    if (!resolvedName) {
      skipped.push({ name: photo.name, reason: 'not-in-database',
        detail: `No direct match or alias for "${photo.name}"` });
      continue;
    }

    // After alias resolution, verify exactly one DB record matches.
    const directMatches = records.filter(r => r.name === photo.name);
    const aliasMatch = resolvedName !== photo.name ? nameToRecord.get(resolvedName) : undefined;
    const allMatches = directMatches.length > 0 ? directMatches : (aliasMatch ? [aliasMatch] : []);

    if (allMatches.length !== 1) {
      skipped.push({ name: photo.name, reason: 'ambiguous-name',
        detail: `Resolved to ${allMatches.length} DB records` });
      continue;
    }

    const destination = allMatches[0];
    const images = destination.images;
    const newUrl = photo.imageUrl;

    // Idempotency: local image already present → skip regardless of role.
    if (images.some(img => img.imageUrl === newUrl)) {
      skipped.push({ name: photo.name, reason: 'already-present',
        detail: `${newUrl} already in destination ${destination.id}` });
      continue;
    }

    // Classify existing primary image.
    const primaryImg = images.find(img => img.isPrimary) ?? images[0] ?? null;
    const primaryKind = primaryImg ? classifyUrl(primaryImg.imageUrl) : null;
    const hasCloudinaryPrimary = primaryKind === 'cloudinary';
    const isPlaceholderPrimary = primaryKind === 'placeholder';
    const isLegacySeedPrimary = primaryKind === 'legacy-seed';
    const hasNoImages = images.length === 0;

    // Case A — Cloudinary primary exists: add local as non-primary secondary.
    if (hasCloudinaryPrimary) {
      const maxOrder = images.reduce((m, img) => Math.max(m, img.displayOrder), -1);
      operations.push({
        kind: 'add-secondary-beside-cloudinary',
        destinationId: destination.id,
        destinationName: destination.name,
        currentUrl: primaryImg!.imageUrl,
        currentKind: 'cloudinary',
        imageUrl: newUrl,
        isPrimary: false,
        displayOrder: maxOrder + 1,
        reason: 'Cloudinary primary preserved; local photo added as secondary',
      });
      continue;
    }

    // Case B — placeholder is primary: replace it.
    if (isPlaceholderPrimary) {
      operations.push({
        kind: 'replace-placeholder',
        destinationId: destination.id,
        destinationName: destination.name,
        imageId: primaryImg!.id,
        currentUrl: primaryImg!.imageUrl,
        currentKind: 'placeholder',
        imageUrl: newUrl,
        isPrimary: true,
        displayOrder: primaryImg!.displayOrder,
        reason: 'Replace placeholder with real landmark photo',
      });
      continue;
    }

    // Case C — legacy seed is primary: replace it.
    if (isLegacySeedPrimary) {
      operations.push({
        kind: 'replace-legacy-seed',
        destinationId: destination.id,
        destinationName: destination.name,
        imageId: primaryImg!.id,
        currentUrl: primaryImg!.imageUrl,
        currentKind: 'legacy-seed',
        imageUrl: newUrl,
        isPrimary: true,
        displayOrder: primaryImg!.displayOrder,
        reason: 'Replace legacy Unsplash seed with real landmark photo',
      });
      continue;
    }

    // Case D — no images: create primary.
    if (hasNoImages) {
      operations.push({
        kind: 'create-primary',
        destinationId: destination.id,
        destinationName: destination.name,
        imageUrl: newUrl,
        isPrimary: true,
        displayOrder: 0,
        reason: 'Destination has no images; create real landmark photo as primary',
      });
      continue;
    }

    // Case F — other/ambiguous existing primary (not Cloudinary, not placeholder, not seed).
    // This includes generic local .webp images from the original seed, static hero images, etc.
    // Do not overwrite without explicit human review.
    skipped.push({
      name: photo.name,
      reason: 'protected-existing-image',
      detail: `Primary is [${primaryKind}] ${primaryImg?.imageUrl?.slice(0, 80)}`,
    });
  }

  return { operations, skipped };
}
