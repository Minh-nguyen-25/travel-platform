const assert = require('node:assert/strict');
const test = require('node:test');
const { searchChatDestinations } = require('../dist/src/repositories/ai.repository.js');

test('database retrieval can include an accentless matching place outside the top-rated pool', async () => {
  const target = {
    id: 901, name: 'Biển Mỹ Khê', address: 'Đà Nẵng', description: 'Tắm biển',
    rating: { toNumber: () => 4.1 }, categories: [],
  };
  const unrelated = Array.from({ length: 300 }, (_, index) => ({
    id: index + 1, name: `Điểm ${index + 1}`, address: 'Hà Nội',
    description: null, rating: { toNumber: () => 4.9 }, categories: [],
  }));
  const database = {
    $queryRaw: async () => [{ id: 901 }],
    destination: {
      findMany: async ({ where }) => where.id?.in ? [target] : unrelated,
    },
  };
  const result = await searchChatDestinations(database, 'Da Nang bien', 10);
  assert.deepEqual(result.map(({ id }) => id), [901]);
});
