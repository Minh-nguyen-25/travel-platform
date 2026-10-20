export type ScenicTheme = 'nature' | 'coast' | 'food' | 'heritage' | 'city' | 'journey';

export interface ScenicPhoto {
  src: string;
  caption: string;
  themes?: readonly ScenicTheme[];
  originalSrc?: string;
  width?: number;
  height?: number;
}

export interface ScenicInput {
  categoryNames?: string[];
  photos?: ScenicPhoto[];
}

interface ScenicDestination {
  name: string;
  images: Array<{ imageUrl: string; isPrimary: boolean }>;
  categories?: Array<{ name: string }>;
}

const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
const matchers: Array<[ScenicTheme, string[]]> = [
  ['food', ['am thuc', 'mon an', 'food', 'ca phe', 'pho ', 'banh mi']],
  ['coast', ['bien', 'dao', 'beach', 'island', 'phu quoc', 'ha long', 'my khe']],
  ['heritage', ['lich su', 'di tich', 'di san', 'van hoa', 'hoi an', 'van mieu']],
  ['city', ['giai tri', 'mua sam', 'thanh pho', 'do thi', 'nguyen hue', 'sai gon']],
  ['nature', ['nui', 'rung', 'thien nhien', 'trekking', 'phieu luu', 'ha giang', 'sa pa', 'ninh binh', 'da lat']],
];

export function resolveScenicThemes(pathname: string, search: string, categoryNames: readonly string[] = []): ScenicTheme[] {
  const names = categoryNames.length ? categoryNames : [new URLSearchParams(search).get('search') ?? ''];
  const matched = [...new Set(names.flatMap((name) => {
    const value = normalize(name);
    return matchers.filter(([, keywords]) => keywords.some((keyword) => value.includes(keyword))).map(([theme]) => theme);
  }))];
  if (/^\/(trips|shared-trip|preferences|ai-chat)(\/|$)/.test(pathname)) return [...new Set<ScenicTheme>(['journey', ...matched])];
  if (matched.length) return matched;
  return ['nature', 'coast', 'food', 'heritage', 'journey', 'city'];
}

export function isScenicImageUrl(value: string): boolean {
  if (/^\/(images|uploads)\//.test(value)) return true;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password;
  } catch { return false; }
}

const photoKey = (photo: ScenicPhoto) => (photo.originalSrc ?? photo.src).split(/[?#]/)[0];

/** Uses only fields already present in destination, favorite and itinerary responses. */
export function scenicInputFromDestinations(destinations: readonly ScenicDestination[]): ScenicInput {
  return {
    categoryNames: [...new Set(destinations.flatMap((destination) => destination.categories?.map((category) => category.name) ?? []))],
    photos: destinations.flatMap((destination) => [...destination.images]
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
      .slice(0, 2)
      .map((image) => ({ src: image.imageUrl, caption: destination.name })))
      .filter((photo) => isScenicImageUrl(photo.src)).slice(0, 4),
  };
}

const relatedThemes: Record<ScenicTheme, ScenicTheme[]> = {
  nature: ['journey', 'coast'], coast: ['nature', 'journey'], food: ['city', 'heritage'],
  heritage: ['city', 'nature'], city: ['food', 'heritage'], journey: ['nature', 'coast', 'city'],
};

/** Interleaves multiple categories and deduplicates local/API versions of the same photo. */
export function selectScenicPhotos(catalog: readonly ScenicPhoto[], themes: readonly ScenicTheme[], input: ScenicInput = {}): ScenicPhoto[] {
  const interleave = (selected: readonly ScenicTheme[]) => {
    const groups = selected.map((theme) => catalog.filter((photo) => photo.themes?.includes(theme)));
    return Array.from({ length: Math.max(0, ...groups.map((group) => group.length)) })
      .flatMap((_, index) => groups.flatMap((group) => group[index] ? [group[index]] : []));
  };
  const supplied = (input.photos ?? []).filter((photo) => isScenicImageUrl(photo.src)).map((photo) =>
    catalog.find((entry) => photoKey(entry) === photoKey(photo) || entry.src === photo.src) ?? photo);
  const candidates = [
    ...supplied,
    ...interleave(themes),
    ...interleave([...new Set(themes.flatMap((theme) => relatedThemes[theme]))]),
    ...catalog,
  ];
  const seen = new Set<string>();
  return candidates.filter((photo) => {
    const key = photoKey(photo);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 36);
}
