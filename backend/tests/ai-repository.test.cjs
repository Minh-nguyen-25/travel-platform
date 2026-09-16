const assert = require('node:assert/strict');
const test = require('node:test');

const { searchChatDestinations } = require('../dist/src/repositories/ai.repository.js');

const destination = {
  id: 7,
  name: 'Bảo tàng Dân tộc học',
  address: 'Nguyễn Văn Huyên, Hà Nội',
  description: 'Trưng bày văn hóa các dân tộc Việt Nam.',
  ticketPrice: { toNumber: () => 40000 },
  openingHoursNote: null,
  visitDuration: null,
  rating: { toNumber: () => 4.8 },
  categories: [{ category: { name: 'Bảo tàng' } }],
};

test('repository search would regress if matching candidates outside the top-rated pool were omitted', async () => {
  const calls = [];
  const database = {
    $queryRaw: async () => [{ id: 7 }],
    destination: {
      findMany: async (arguments_) => {
        calls.push(arguments_);
        return [destination];
      },
    },
  };

  const result = await searchChatDestinations(database, 'bao tang dan toc hoc', 10);

  assert.equal(result[0].name, 'Bảo tàng Dân tộc học');
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].where, { isActive: true, id: { in: [7] } });
});
