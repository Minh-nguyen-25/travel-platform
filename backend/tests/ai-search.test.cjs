const assert = require('node:assert/strict');
const test = require('node:test');
const {
  rankDestinationsForChat, VIETNAMESE_SQL_FROM, VIETNAMESE_SQL_TO,
} = require('../dist/src/utils/ai-search.js');

const destinations = [
  { id: 1, name: 'Hồ Gươm', address: 'Hà Nội', description: 'Đi bộ quanh hồ', rating: { toNumber: () => 4.9 }, categories: [] },
  { id: 2, name: 'Biển Mỹ Khê', address: 'Đà Nẵng', description: 'Tắm biển', rating: { toNumber: () => 4.2 }, categories: [] },
  { id: 3, name: 'Bảo tàng Chăm', address: 'Đà Nẵng', description: 'Văn hóa', rating: { toNumber: () => 4.8 }, categories: [] },
];

test('chat retrieval prioritizes a relevant lower-rated place with accentless Vietnamese', () => {
  const result = rankDestinationsForChat(destinations, 'Da Nang bien', 1);
  assert.deepEqual(result.map(({ id }) => id), [2]);
});

test('chat retrieval does not present unrelated places as question matches', () => {
  const result = rankDestinationsForChat(destinations, 'Sa Pa trekking', 10);
  assert.deepEqual(result, []);
});

test('generic destination suggestions retain a bounded rated fallback', () => {
  const result = rankDestinationsForChat(destinations, 'Gợi ý địa điểm phù hợp', 2);
  assert.deepEqual(result.map(({ id }) => id), [1, 3]);
});

test('database accent fold covers common Vietnamese place and activity names', () => {
  const folded = [...'đà nẵng biển mỹ khê'].map((letter) => {
    const index = VIETNAMESE_SQL_FROM.indexOf(letter);
    return index < 0 ? letter : VIETNAMESE_SQL_TO[index];
  }).join('');
  assert.equal(folded, 'da nang bien my khe');
});
