const assert = require('node:assert/strict');
const test = require('node:test');

const {
  getChatSearchTerms,
  rankDestinationsForChat,
  VIETNAMESE_SQL_FROM,
  VIETNAMESE_SQL_TO,
} = require('../dist/src/utils/ai-search.js');

const destinations = [
  {
    id: 1,
    name: 'Bảo tàng Dân tộc học',
    address: 'Nguyễn Văn Huyên, Hà Nội',
    description: 'Trưng bày văn hóa các dân tộc Việt Nam.',
    rating: { toNumber: () => 4.8 },
    categories: [{ category: { name: 'Bảo tàng' } }],
  },
  {
    id: 2,
    name: 'Bảo tàng Hà Nội',
    address: 'Mễ Trì, Hà Nội',
    description: 'Bảo tàng lịch sử thành phố.',
    rating: { toNumber: () => 4.9 },
    categories: [{ category: { name: 'Bảo tàng' } }],
  },
];

test('ranking would regress if Vietnamese diacritic normalization stopped matching a destination name', () => {
  const ranked = rankDestinationsForChat(destinations, 'bao tang dan toc hoc', 10);

  assert.equal(ranked[0].name, 'Bảo tàng Dân tộc học');
});

test('ranking would regress if equally scored and rated destinations kept their input order', () => {
  const ranked = rankDestinationsForChat([
    { ...destinations[0], id: 9, rating: { toNumber: () => 4.8 } },
    { ...destinations[0], id: 3, rating: { toNumber: () => 4.8 } },
  ], 'bao tang', 10);

  assert.deepEqual(ranked.map(({ id }) => id), [3, 9]);
});

test('search terms would regress if generic Vietnamese chat wording became a destination term', () => {
  assert.deepEqual(getChatSearchTerms('Gợi ý địa điểm cho mình'), []);
});

test('database normalization would regress if lowercase đ stopped mapping to d', () => {
  assert.match(VIETNAMESE_SQL_FROM, /đ/);
  assert.equal(VIETNAMESE_SQL_FROM.length, VIETNAMESE_SQL_TO.length);
});
