// Opt-in integration check: requires the configured PostgreSQL and Redis services.
// Creates isolated test accounts and removes only their data at the end.
require('dotenv/config');
process.env.NODE_ENV = 'test';
const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const app = require('../dist/src/app.js').default;
const prisma = require('../dist/src/config/db.js').default;
const redis = require('../dist/src/config/redis.js').default;
const { generateAccessToken } = require('../dist/src/utils/jwt.utils.js');
const { aiService } = require('../dist/src/services/ai.service.js');
const { mapService } = require('../dist/src/services/map.service.js');

test('PostgreSQL/API: editing, reorder, expense reconciliation, saved chat and public route access', async (t) => {
  const createdUsers = [];
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    if (createdUsers.length) await prisma.user.deleteMany({ where: { id: { in: createdUsers } } });
    await prisma.$disconnect(); redis.disconnect();
  });
  const user = await prisma.user.create({ data: { fullName: 'Upgrade integration test', email: `upgrade-${randomUUID()}@example.test` } });
  createdUsers.push(user.id);
  const other = await prisma.user.create({ data: { fullName: 'Upgrade isolation test', email: `upgrade-${randomUUID()}@example.test` } });
  createdUsers.push(other.id);
  const token = generateAccessToken(user), otherToken = generateAccessToken(other);
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;
  const request = async (method, path, data, auth = token, status = 200) => {
    const response = await fetch(base + path, { method, headers: {
      'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    }, ...(data ? { body: JSON.stringify(data) } : {}) });
    const body = await response.json();
    assert.equal(response.status, status, `${method} ${path}: ${JSON.stringify(body)}`);
    return body.data;
  };
  const destinations = await prisma.destination.findMany({ where: { isActive: true }, take: 2, orderBy: { id: 'asc' } });
  assert.equal(destinations.length, 2, 'Seed at least two destinations before this integration check');
  let trip = await request('POST', '/trips', {
    name: 'Upgrade verification', destinationCity: 'Test city', startDate: '2026-10-20', endDate: '2026-10-22', budget: 1000,
    tripDays: [{ date: '2026-10-20', itineraries: destinations.map((destination, index) => ({
      destinationId: destination.id, startTime: index ? '10:00' : '08:00', endTime: index ? '11:30' : '09:00',
      estimatedCost: 100, travelMode: 'DRIVING',
    })) }],
  }, token, 201);
  const tripId = trip.id, dayId = trip.tripDays[0].id;
  trip = await request('PATCH', `/trips/${tripId}`, { name: 'Updated trip', startDate: '2026-11-01', endDate: '2026-11-03' });
  assert.equal(trip.tripDays[0].date, '2026-11-01');
  await request('PATCH', `/trips/${tripId}/days/${dayId}`, { date: '2026-11-02', note: 'Updated day' });
  const first = trip.tripDays[0].itineraries[0], second = trip.tripDays[0].itineraries[1];
  await request('PATCH', `/trips/${tripId}/days/${dayId}/itineraries/${first.id}`, { estimatedCost: 150, note: 'Updated activity' });
  t.mock.method(mapService, 'calculateDistance', async () => ({ distanceKm: 2, durationMinutes: 15 }));
  const ordered = await request('PUT', `/trips/${tripId}/days/${dayId}/itineraries/order`, { itineraryIds: [second.id, first.id] });
  assert.equal(ordered[0].startTime, '08:00:00'); assert.equal(ordered[0].endTime, '09:30:00');
  assert.equal(ordered[1].startTime, '09:45:00'); assert.equal(ordered[1].endTime, '10:45:00');
  assert.equal(ordered[0].travelDistanceKm, null); assert.equal(ordered[1].travelCalculationSource, 'OSRM');
  const persisted = await request('GET', `/trips/${tripId}`);
  assert.equal(persisted.tripDays[0].itineraries[1].startTime, '09:45:00');
  await request('PUT', `/trips/${tripId}/days/${dayId}/itineraries/order`, { itineraryIds: [first.id] }, token, 422);

  const expense = await request('POST', `/trips/${tripId}/expenses`, { title: 'Dinner', category: 'FOOD', amount: 100.30, incurredOn: '2026-11-02' });
  await request('GET', `/trips/${tripId}/expenses`, null, otherToken, 404);
  await request('POST', `/trips/${tripId}/expenses/${expense.id}/payments`, { amount: 20.10, method: 'CASH', paidOn: '2026-11-02' });
  let ledger = await request('GET', `/trips/${tripId}/expenses`);
  assert.equal(ledger.summary.actual, '100.30'); assert.equal(ledger.summary.paid, '20.10');
  assert.equal(ledger.summary.outstanding, '80.20'); assert.equal(ledger.summary.estimated, '250.00');
  await request('POST', `/trips/${tripId}/expenses/${expense.id}/payments`, { amount: 81, method: 'CASH', paidOn: '2026-11-02' }, token, 422);
  await request('PATCH', `/trips/${tripId}/expenses/${expense.id}`, { title: 'Dinner', category: 'FOOD', amount: 10, incurredOn: '2026-11-02' }, token, 422);
  const concurrent = await Promise.all([1, 2].map(() => fetch(`${base}/trips/${tripId}/expenses/${expense.id}/payments`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 80.20, method: 'BANK_TRANSFER', paidOn: '2026-11-02' }),
  })));
  assert.deepEqual(concurrent.map((response) => response.status).sort(), [200, 422]);
  ledger = await request('GET', `/trips/${tripId}/expenses`);
  assert.equal(ledger.expenses[0].status, 'PAID'); assert.equal(ledger.summary.outstanding, '0.00');

  const chatMock = t.mock.method(aiService, 'chat', async (_id, input) => ({ reply: `Reply ${input.message}`, sources: [], draft: null,
    metadata: { provider: 'ollama', model: 'test', generatedAt: new Date().toISOString() }, context: { tripCount: 0, destinationCount: 0 } }));
  const answer = await request('POST', '/ai/chat', { message: 'First question' });
  assert.ok(answer.conversationId);
  await request('POST', '/ai/chat', { message: 'Second question', conversationId: answer.conversationId });
  assert.equal(chatMock.mock.calls[1].arguments[1].history.length, 2);
  const saved = await request('GET', `/ai/conversations/${answer.conversationId}`);
  assert.deepEqual(saved.messages.map(({ content }) => content), ['First question', 'Reply First question', 'Second question', 'Reply Second question']);
  assert.equal((await request('GET', '/ai/conversations')).length, 1);
  await request('GET', `/ai/conversations/${answer.conversationId}`, null, otherToken, 404);
  await request('POST', '/ai/chat', { message: 'Intrusion', conversationId: answer.conversationId }, otherToken, 404);
  await request('DELETE', `/ai/conversations/${answer.conversationId}`, null, otherToken, 404);

  const share = await request('POST', `/trips/${tripId}/share`);
  let routeCoordinates;
  t.mock.method(mapService, 'calculateRoute', async (input) => { routeCoordinates = input.coordinates; return { ...input, geometry: { type: 'LineString', coordinates: [] } }; });
  const publicTrip = await request('GET', `/trips/shared/${share.shareToken}`, null, null);
  assert.equal(publicTrip.tripDays[0].dayNumber, 2);
  assert.equal(publicTrip.userId, undefined); assert.equal(publicTrip.expenses, undefined);
  await request('POST', `/trips/shared/${share.shareToken}/days/2/route`, { coordinates: [{ latitude: 0, longitude: 0 }] }, null);
  assert.deepEqual(routeCoordinates, [destinations[1], destinations[0]].map((destination) => ({ latitude: Number(destination.latitude), longitude: Number(destination.longitude) })));
  await request('POST', `/trips/shared/${share.shareToken}/days/99/route`, {}, null, 404);
  await request('DELETE', `/trips/${tripId}/share`);
  await request('POST', `/trips/shared/${share.shareToken}/days/2/route`, {}, null, 404);
  await request('DELETE', `/ai/conversations/${answer.conversationId}`);
  assert.equal((await request('GET', '/ai/conversations')).length, 0);
  assert.equal(await prisma.aiMessage.count({ where: { conversationId: answer.conversationId } }), 0);
});
