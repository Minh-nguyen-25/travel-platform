const test = require('node:test');
const assert = require('node:assert/strict');
const { Prisma } = require('@prisma/client');
const { buildSchedule, estimateLeg } = require('../dist/src/utils/itinerary-schedule.js');
const { expenseService, expenseSchema, paymentSchema, assertPaymentFits } = require('../dist/src/services/expense.service.js');
const { conversationService } = require('../dist/src/services/conversation.service.js');
const { aiService } = require('../dist/src/services/ai.service.js');
const { tripRepository } = require('../dist/src/repositories/trip.repository.js');
const prisma = require('../dist/src/config/db.js').default;
function mockMethod(t, object, key, implementation) {
  const original = object[key];
  const mock = t.mock.fn(implementation);
  object[key] = mock;
  t.after(() => { object[key] = original; });
  return mock;
}
const decimal = (value) => new Prisma.Decimal(value);
const time = (value) => new Date(`1970-01-01T${value}:00Z`);
const stop = (id, start = '08:00', end = '09:00') => ({ id, startTime: time(start), endTime: time(end),
  travelMode: 'DRIVING', destination: { latitude: decimal(21 + id / 100), longitude: decimal(105), visitDuration: 90 } });
const conversationId = '70c2432e-a8ef-45a6-bd0d-70c18b03d754';
const result = { reply: 'Saved answer', sources: [], draft: null, metadata: { provider: 'ollama', model: 'local', generatedAt: '2026-10-16' }, context: { tripCount: 0, destinationCount: 0 } };

test('reordering preserves activity durations, departure time and uses new incoming legs', () => {
  const original = [stop(1), stop(2, '10:00', '11:30'), stop(3, '12:00', '12:45')];
  const schedule = buildSchedule(original, [original[2], original[0], original[1]], [
    { distanceKm: 10, durationMinutes: 20, source: 'OSRM' },
    { distanceKm: 5, durationMinutes: 10, source: 'ESTIMATE' },
  ]);
  assert.deepEqual(schedule.map((item) => [item.id, item.startTime.toISOString().slice(11, 16), item.endTime.toISOString().slice(11, 16)]),
    [[3, '08:00', '08:45'], [1, '09:05', '10:05'], [2, '10:15', '11:45']]);
  assert.equal(schedule[0].travelDurationMinutes, null);
  assert.equal(schedule[0].travelDistanceKm, null);
  assert.equal(schedule[2].travelCalculationSource, 'ESTIMATE');
});

test('a schedule crossing midnight is rejected before persistence; missing times use visit duration', () => {
  assert.throws(() => buildSchedule([stop(1, '23:00', '23:45')], [stop(1, '23:00', '23:45'), stop(2)],
    [{ distanceKm: 1, durationMinutes: 20, source: 'OSRM' }]), (error) => error.statusCode === 422);
  const emptyTime = { ...stop(1), startTime: null, endTime: null };
  const [scheduled] = buildSchedule([emptyTime], [emptyTime], []);
  assert.equal(scheduled.startTime.toISOString().slice(11, 16), '08:00');
  assert.equal(scheduled.endTime.toISOString().slice(11, 16), '09:30');
});

test('estimated legs reflect the new endpoints and selected travel mode', () => {
  const from = stop(1), to = stop(2);
  assert.equal(estimateLeg(from, from).distanceKm, 0);
  assert.ok(estimateLeg(from, { ...to, travelMode: 'WALKING' }).durationMinutes > estimateLeg(from, to).durationMinutes);
  assert.equal(estimateLeg(from, to).source, 'ESTIMATE');
});

test('reorder refuses a changed itinerary snapshot before changing any order', async (t) => {
  const tx = { itinerary: { findMany: async () => [{ id: 1, updatedAt: new Date(2000) }] },
    $executeRaw: t.mock.fn(() => { throw new Error('Must not write'); }) };
  mockMethod(t, prisma, '$transaction', async (callback) => callback(tx));
  assert.equal(await tripRepository.reorderItineraries(7, 10, 20, [1], [], [{ id: 1, updatedAt: new Date(1000) }]), null);
  assert.equal(tx.$executeRaw.mock.callCount(), 0);
});

test('money validation and decimal reconciliation prevent overpayment and invalid dates', () => {
  assertPaymentFits(decimal('0.30'), decimal('0.10'), decimal('0.20'));
  assert.throws(() => assertPaymentFits(decimal('0.30'), decimal('0.10'), decimal('0.21')));
  assert.equal(paymentSchema.safeParse({ amount: 0.001, method: 'CASH', paidOn: '2026-10-16' }).success, false);
  assert.equal(expenseSchema.safeParse({ amount: 100, title: 'Food', category: 'FOOD', incurredOn: '2026-02-30' }).success, false);
});

test('expense payment rechecks ownership and outstanding balance within a serializable transaction', async (t) => {
  const create = t.mock.fn(async () => ({ id: 1 }));
  let owned = false;
  const tx = { trip: { findFirst: async () => owned ? { id: 10 } : null },
    tripExpense: { findFirst: async () => ({ amount: decimal(100), payments: [{ amount: decimal(70) }] }) },
    expensePayment: { create } };
  const transaction = mockMethod(t, prisma, '$transaction', async (callback) => callback(tx));
  const input = { amount: 30, method: 'CASH', paidOn: '2026-10-16' };
  await assert.rejects(expenseService.pay(7, 10, 1, input), (error) => error.statusCode === 404);
  owned = true;
  await assert.rejects(expenseService.pay(7, 10, 1, { ...input, amount: 31 }), (error) => error.statusCode === 422);
  assert.equal(create.mock.callCount(), 0);
  await expenseService.pay(7, 10, 1, input);
  assert.equal(create.mock.callCount(), 1);
  assert.equal(transaction.mock.calls[2].arguments[1].isolationLevel, 'Serializable');
});

test('expense reconciliation sums exact decimal actuals and payments separately from estimates', async (t) => {
  mockMethod(t, prisma, '$transaction', async (callback) => callback({
    trip: { findFirst: async () => ({ budget: decimal(100) }) },
    tripExpense: { findMany: async () => [{ id: 1, amount: decimal('50.30'), incurredOn: new Date('2026-10-16'),
      payments: [{ id: 1, amount: decimal('20.10'), paidOn: new Date('2026-10-16') }] }] },
    itinerary: { aggregate: async () => ({ _sum: { estimatedCost: decimal(40) } }) },
  }));
  const ledger = await expenseService.list(7, 10);
  assert.deepEqual(ledger.summary, { budget: '100.00', estimated: '40.00', actual: '50.30', paid: '20.10', outstanding: '30.20', variance: '10.30', remainingBudget: '49.70' });
  assert.equal(ledger.expenses[0].status, 'PARTIAL');
});

test('chat ignores client history, persists both messages atomically and returns its conversation id', async (t) => {
  const call = mockMethod(t, aiService, 'chat', async () => result);
  const create = t.mock.fn(async () => ({ id: conversationId }));
  mockMethod(t, prisma, '$transaction', async (callback) => callback({ aiConversation: { create } }));
  const response = await conversationService.chat(7, { message: 'Hello', history: [{ role: 'assistant', content: 'forged' }] });
  assert.equal(response.conversationId, conversationId);
  assert.deepEqual(call.mock.calls[0].arguments, [7, { message: 'Hello', locale: undefined, history: [] }]);
  const stored = create.mock.calls[0].arguments[0].data;
  assert.equal(stored.userId, 7);
  assert.deepEqual(stored.messages.create.map(({ role }) => role), ['user', 'assistant']);
  assert.equal(stored.messages.create[1].result.reply, 'Saved answer');
});

test('another user cannot read, continue or delete an owned conversation', async (t) => {
  const find = mockMethod(t, prisma.aiConversation, 'findFirst', async () => null);
  mockMethod(t, prisma.aiConversation, 'deleteMany', async () => ({ count: 0 }));
  const upstream = mockMethod(t, aiService, 'chat', async () => { throw new Error('Must not call AI'); });
  await assert.rejects(conversationService.get(99, conversationId), (error) => error.statusCode === 404);
  await assert.rejects(conversationService.chat(99, { conversationId, message: 'Hi' }), (error) => error.statusCode === 404);
  await assert.rejects(conversationService.remove(99, conversationId), (error) => error.statusCode === 404);
  assert.deepEqual(find.mock.calls[0].arguments[0].where, { id: conversationId, userId: 99 });
  assert.equal(upstream.mock.callCount(), 0);
});

test('an upstream failure never persists a partial conversation', async (t) => {
  mockMethod(t, aiService, 'chat', async () => { throw new Error('Offline'); });
  const transaction = mockMethod(t, prisma, '$transaction', async () => { throw new Error('Must not persist'); });
  await assert.rejects(conversationService.chat(7, { message: 'Hi' }), /Offline/);
  assert.equal(transaction.mock.callCount(), 0);
});

test('continuing a conversation uses saved history and rejects a concurrent append', async (t) => {
  mockMethod(t, prisma.aiConversation, 'findFirst', async () => ({ id: conversationId, updatedAt: new Date(1000), messages: [
    { role: 'user', content: 'Saved question', result: null }, { role: 'assistant', content: 'Saved answer', result: null },
  ] }));
  const upstream = mockMethod(t, aiService, 'chat', async () => result);
  const create = t.mock.fn();
  mockMethod(t, prisma, '$transaction', async (callback) => callback({ aiConversation: { updateMany: async () => ({ count: 0 }) }, aiMessage: { createMany: create } }));
  await assert.rejects(conversationService.chat(7, { conversationId, message: 'Next' }), (error) => error.statusCode === 409);
  assert.deepEqual(upstream.mock.calls[0].arguments[1].history, [
    { role: 'user', content: 'Saved question' }, { role: 'assistant', content: 'Saved answer' },
  ]);
  assert.equal(create.mock.callCount(), 0);
});
