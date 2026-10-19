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

test('repository search would regress if matching candidates outside the top-rated pool skipped normalized, active, bounded SQL retrieval', async () => {
  const calls = [];
  const rawQueries = [];
  const database = {
    $queryRaw: async (sql) => {
      rawQueries.push(sql);
      return [{ id: 7 }];
    },
    destination: {
      findMany: async (arguments_) => {
        calls.push(arguments_);
        return [destination];
      },
    },
  };

  const result = await searchChatDestinations(database, 'bao tang dan toc hoc', 10);

  assert.equal(result[0].name, 'Bảo tàng Dân tộc học');
  assert.equal(rawQueries.length, 1);
  assert.match(
    rawQueries[0].sql,
    /translate\s*\(\s*normalize\s*\(\s*lower\s*\(\s*coalesce\s*\(\s*d\.name,\s*''\s*\)\s*\),\s*NFC\s*\)/
  );
  assert.match(rawQueries[0].sql, /WHERE\s+d\.is_active\s*=\s*true/);
  assert.match(rawQueries[0].sql, /LIMIT\s+\?/);
  assert.ok(rawQueries[0].values.includes('%bao%'));
  assert.ok(rawQueries[0].values.includes(300));
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].where, { isActive: true, id: { in: [7] } });
});
