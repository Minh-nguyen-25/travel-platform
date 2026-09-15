const GENERIC_WORDS = new Set([
  'ai', 'ban', 'bai', 'cho', 'chuyen', 'cua', 'di', 'dia', 'diem', 'du', 'duoc',
  'goi', 'giup', 'hop', 'lich', 'minh', 'mot', 'muon', 'nay', 'nen', 'ngay',
  'noi', 'phu', 'sap', 'so', 'thich', 'toi', 'trinh', 'tu', 'van', 've', 'voi',
  'what', 'where', 'which', 'travel', 'trip', 'place', 'places', 'suggest',
]);

// PostgreSQL translate() uses positional character mappings. These cover
// Vietnamese precomposed letters after lower() and NFC normalization.
const vietnameseGroups = [
  ['a', 'áàảãạăắằẳẵặâấầẩẫậ'],
  ['e', 'éèẻẽẹêếềểễệ'],
  ['i', 'íìỉĩị'],
  ['o', 'óòỏõọôốồổỗộơớờởỡợ'],
  ['u', 'úùủũụưứừửữự'],
  ['y', 'ýỳỷỹỵ'],
  ['d', 'đ'],
] as const;
export const VIETNAMESE_SQL_FROM = vietnameseGroups.map(([, accented]) => accented).join('');
export const VIETNAMESE_SQL_TO = vietnameseGroups
  .map(([plain, accented]) => plain.repeat([...accented].length)).join('');

const normalize = (value: string): string => value.toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd');

const words = (value: string): string[] => normalize(value).match(/[a-z0-9]+/g) ?? [];

export const getChatSearchTerms = (query: string): string[] => [
  ...new Set(words(query).filter((word) => word.length >= 2 && !GENERIC_WORDS.has(word))),
].slice(0, 6);

interface SearchableDestination {
  name: string;
  address: string;
  description: string | null;
  rating: { toNumber(): number };
  categories: Array<{ category: { name: string } }>;
}

export const rankDestinationsForChat = <T extends SearchableDestination>(
  destinations: T[],
  query: string,
  limit: number
): T[] => {
  const terms = getChatSearchTerms(query);
  const scored = destinations.map((destination) => {
    const name = new Set(words(destination.name));
    const address = new Set(words(destination.address));
    const categories = new Set(words(destination.categories.map(({ category }) => category.name).join(' ')));
    const description = new Set(words(destination.description ?? ''));
    const score = terms.reduce((total, term) => total +
      (name.has(term) ? 5 : 0) +
      (address.has(term) ? 4 : 0) +
      (categories.has(term) ? 3 : 0) +
      (description.has(term) ? 1 : 0), 0);
    return { destination, score };
  });

  return scored
    .filter(({ score }) => terms.length === 0 || score > 0)
    .sort((a, b) => b.score - a.score ||
      b.destination.rating.toNumber() - a.destination.rating.toNumber())
    .slice(0, limit)
    .map(({ destination }) => destination);
};
