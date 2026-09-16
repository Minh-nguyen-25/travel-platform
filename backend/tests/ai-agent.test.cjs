const assert = require('node:assert/strict');
const test = require('node:test');
const { AiService } = require('../dist/src/services/ai.service.js');
const { verifyAiDraftProof } = require('../dist/src/utils/ai-draft.utils.js');

const authenticatedUserId = 7;
const numberLike = (value) => ({ toNumber: () => value });
const destination = {
  id: 9, name: 'Văn Miếu', address: 'Hà Nội', description: 'Di tích văn hóa',
  latitude: numberLike(21.028), longitude: numberLike(105.836),
  ticketPrice: numberLike(70000), rating: numberLike(4.7),
  openingHoursNote: null, visitDuration: 60,
  categories: [{ category: { name: 'Văn hóa' } }],
};
const itinerary = {
  title: 'Một ngày Hà Nội', summary: 'Khám phá văn hóa',
  days: [{ dayNumber: 1, theme: 'Văn hóa', note: '', activities: [{
    destinationId: 9, startTime: '09:00', endTime: '10:00', estimatedCost: 70000,
    travelMode: 'WALKING', note: '',
  }] }],
};
const call = (name, args = {}, id = 'call-1') => ({ name, args, id });
const prepare = (startDate = '2026-10-20', extra = {}) => call('prepare_itinerary', {
  destinationCity: 'Hà Nội', days: 1, startDate, ...extra,
});
const planMessage = 'Lập lịch trình Hà Nội 1 ngày, bắt đầu 2026-10-20';

// Only database/network boundaries are faked. Draft validation and signing stay real.
function harness(provider, rounds = [], overrides = {}) {
  const requests = [];
  let chatIndex = 0;
  let saveTripCallCount = 0;
  const repository = {
    findPreference: test.mock.fn(async () => ({ budgetLevel: 'MEDIUM', travelStyle: null,
      preferredActivities: [], preferredCategories: [] })),
    findUserTripsForChat: test.mock.fn(async () => []),
    findDestinationsForChat: test.mock.fn(async () => [destination]),
    findActiveDestinations: test.mock.fn(async () => [destination]),
    saveTrip: async () => { saveTripCallCount += 1; },
    createTrip: async () => { saveTripCallCount += 1; },
    ...overrides.repository,
  };
  const config = {
    provider, apiKey: 'agent-test-key', model: provider === 'gemini' ? 'gemini-3.5-flash' : 'test-model',
    chatModel: provider === 'gemini' ? 'gemini-chat-test' : 'test-model',
    baseUrl: 'https://provider.test/v1', timeoutMs: 1000, maxRetries: 0,
    maxOutputTokens: 4000, maxDestinationCandidates: 10, routingEnabled: false,
    maxRoutingLegs: 12, routingConcurrency: 2, routingDeadlineMs: 15000,
    openAiOrganization: null, openAiProject: null, ...overrides.config,
  };
  const fetchMock = async (url, init) => {
    const body = JSON.parse(init.body);
    const generation = Boolean(body.text?.format || body.generationConfig?.responseJsonSchema);
    requests.push({ url: String(url), body, generation });
    const output = generation ? JSON.stringify(itinerary) : (rounds[chatIndex++] ?? 'Đã kiểm tra dữ liệu.');
    const payload = provider === 'openai'
      ? { output: typeof output === 'string'
        ? [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: output }] }]
        : output.map((item) => ({ type: 'function_call', name: item.name,
          arguments: item.rawArguments ?? JSON.stringify(item.args), call_id: item.id })) }
      : { candidates: [{ content: { role: 'model', parts: typeof output === 'string'
        ? [{ text: output }]
        : output.map((item) => ({ functionCall: { name: item.name, args: item.args, id: item.id },
          thoughtSignature: 'provider-thought-signature' })) } }] };
    return new Response(JSON.stringify(payload), { status: 200 });
  };
  return { service: new AiService(repository, {}, () => config, fetchMock), repository, requests,
    get saveTripCallCount() { return saveTripCallCount; } };
}

function toolOutputs(provider, request) {
  return provider === 'openai'
    ? request.body.input.filter((item) => item.type === 'function_call_output').map((item) => JSON.parse(item.output))
    : request.body.contents.flatMap((item) => item.parts).filter((item) => item.functionResponse).map((item) => item.functionResponse.response);
}

for (const provider of ['openai', 'gemini']) {
  test(`${provider}: returns catalog sources and a null draft for plain chat`, async () => {
    const h = harness(provider);
    const result = await h.service.chat(authenticatedUserId, { message: 'Gợi ý tham quan Hà Nội' });
    assert.deepEqual(result.sources, [{ id: 9, name: 'Văn Miếu' }]);
    assert.equal(result.draft, null);
    assert.equal(result.context.destinationCount, 1);
  });

  test(`${provider}: executes parsed search and replays its catalog result`, async () => {
    const h = harness(provider, [[call('search_destinations', { query: '  Văn Miếu  ' })], 'Có Văn Miếu.'], {
      repository: { findDestinationsForChat: test.mock.fn(async (query) => query === 'Văn Miếu'
        ? [destination] : [{ ...destination, id: 8, name: 'Hồ Hoàn Kiếm' }]) },
    });
    const result = await h.service.chat(authenticatedUserId, { message: 'Tìm di tích' });
    assert.equal(result.reply, 'Có Văn Miếu.');
    assert.ok(h.repository.findDestinationsForChat.mock.calls.some(({ arguments: args }) => args[0] === 'Văn Miếu' && args[1] > 0 && args[1] <= 30));
    assert.match(JSON.stringify(toolOutputs(provider, h.requests[1])), /Văn Miếu/);
    assert.deepEqual(result.sources, [{ id: 9, name: 'Văn Miếu' }, { id: 8, name: 'Hồ Hoàn Kiếm' }]);
    assert.equal(result.context.destinationCount, 2);
    if (provider === 'openai') {
      assert.ok(h.requests[0].body.tools.some((tool) => tool.name === 'search_destinations'));
      assert.equal(h.requests[1].body.input.find((item) => item.type === 'function_call_output').call_id, 'call-1');
      assert.ok(h.requests[1].body.input.some((item) => item.type === 'function_call'));
    } else {
      assert.ok(h.requests[0].body.tools[0].functionDeclarations.some((tool) => tool.name === 'search_destinations'));
      assert.equal(h.requests[1].body.contents.find((item) => item.role === 'model').parts[0].thoughtSignature, 'provider-thought-signature');
    }
  });

  test(`${provider}: get_my_trips cannot select a model-supplied user ID`, async () => {
    const h = harness(provider, [[call('get_my_trips', { userId: 999 })], 'Không có chuyến đi.']);
    const result = await h.service.chat(authenticatedUserId, { message: 'Chuyến đi của tôi' });
    assert.equal(result.reply, 'Không có chuyến đi.');
    assert.equal(h.repository.findUserTripsForChat.mock.calls[0].arguments[0], authenticatedUserId);
    assert.ok(h.repository.findUserTripsForChat.mock.calls.every(({ arguments: args }) => args[0] === authenticatedUserId));
    assert.equal(toolOutputs(provider, h.requests[1]).length, 1);
  });

  test(`${provider}: prepares a validated signed draft without persisting a trip`, async () => {
    const h = harness(provider, [[prepare()], 'Bản nháp đã sẵn sàng để xác nhận.']);
    const result = await h.service.chat(authenticatedUserId, { message: planMessage });
    assert.equal(result.draft.tripDraft.startDate, '2026-10-20');
    assert.equal(result.draft.itinerary.days[0].activities[0].destinationName, 'Văn Miếu');
    assert.equal(result.draft.budgetLevel, 'MEDIUM');
    assert.ok(result.draft.tripDraft.aiProofToken);
    const draft = result.draft.tripDraft;
    assert.equal(verifyAiDraftProof(draft.aiProofToken, authenticatedUserId, draft, draft.aiRawData), true);
    assert.equal(verifyAiDraftProof(draft.aiProofToken, 999, draft, draft.aiRawData), false);
    assert.deepEqual(result.draft.warnings, []);
    assert.equal(h.saveTripCallCount, 0);
    assert.equal(h.requests.filter((request) => request.generation).length, 1);
  });

  for (const scenario of [
    { name: 'model-invented date', input: { message: 'Lập lịch trình Hà Nội 1 ngày' } },
    { name: 'assistant-only date', input: { message: 'Lập lịch trình Hà Nội 1 ngày', history: [{ role: 'assistant', content: 'Ngày 2026-10-20 nhé' }] } },
    { name: 'old plan date on a new request', input: { message: 'Lập lịch trình Hà Nội 1 ngày', history: [{ role: 'user', content: 'Lập lịch trình Huế 2 ngày từ 2026-10-20' }, { role: 'assistant', content: 'Đây là lịch trình Huế.' }] } },
    { name: 'unrelated current message', input: { message: 'Cảm ơn', history: [{ role: 'user', content: planMessage }] } },
    { name: 'date different from current user date', input: { message: 'Lập lịch trình Hà Nội 1 ngày từ 2026-10-21' } },
  ]) {
    test(`${provider}: blocks ${scenario.name}`, async () => {
      const h = harness(provider, [[prepare()], 'Bạn muốn bắt đầu ngày nào?']);
      const result = await h.service.chat(authenticatedUserId, scenario.input);
      assert.equal(result.draft, null);
      assert.equal(h.requests.filter((request) => request.generation).length, 0);
      assert.match(JSON.stringify(toolOutputs(provider, h.requests.at(-1))), /error|missing|date|ngày/i);
    });
  }

  test(`${provider}: a current date follow-up can complete the active plan`, async () => {
    const h = harness(provider, [[prepare()], 'Bản nháp đã sẵn sàng.']);
    const result = await h.service.chat(authenticatedUserId, { message: '2026-10-20', history: [
      { role: 'user', content: 'Lập lịch trình Hà Nội 1 ngày' },
      { role: 'assistant', content: 'Bạn muốn bắt đầu ngày nào?' },
    ] });
    assert.equal(result.draft.tripDraft.startDate, '2026-10-20');
  });

  test(`${provider}: search then prepare can complete two tool rounds`, async () => {
    const h = harness(provider, [[call('search_destinations', { query: 'Hà Nội' })], [prepare()], 'Bản nháp để xác nhận.']);
    const result = await h.service.chat(authenticatedUserId, { message: planMessage });
    assert.equal(result.draft.tripDraft.startDate, '2026-10-20');
    const chatRequests = h.requests.filter((request) => !request.generation);
    assert.equal(chatRequests.length, 3);
    assert.equal(toolOutputs(provider, chatRequests[2]).length, 2);
    if (provider === 'openai') assert.equal(chatRequests[2].body.tool_choice, 'none');
    else assert.equal(chatRequests[2].body.toolConfig.functionCallingConfig.mode, 'NONE');
    assert.equal(h.saveTripCallCount, 0);
  });

  test(`${provider}: never executes a third tool round even if the provider ignores disabling tools`, async () => {
    const h = harness(provider, [
      [call('search_destinations', { query: 'round-one' })],
      [call('search_destinations', { query: 'round-two' })],
      [call('search_destinations', { query: 'forbidden-third' })],
    ]);
    await assert.rejects(() => h.service.chat(authenticatedUserId, { message: 'Tìm địa điểm' }), (error) => error.statusCode === 502);
    assert.equal(h.requests.length, 3);
    assert.ok(!h.repository.findDestinationsForChat.mock.calls.some(({ arguments: args }) => args[0] === 'forbidden-third'));
  });

  test(`${provider}: refuses a round with more than three tool calls before executing it`, async () => {
    const h = harness(provider, [[1, 2, 3, 4].map((n) => call('search_destinations', { query: `forbidden-${n}` }, `call-${n}`))]);
    await assert.rejects(() => h.service.chat(authenticatedUserId, { message: 'Tìm địa điểm' }), (error) => {
      assert.equal(error.statusCode, 502);
      assert.match(error.message, /quá nhiều|giới hạn/i);
      return true;
    });
    assert.ok(!h.repository.findDestinationsForChat.mock.calls.some(({ arguments: args }) => args[0].startsWith('forbidden-')));
  });

  test(`${provider}: permits three valid calls in a round and rejects unknown tools safely`, async () => {
    const h = harness(provider, [[call('search_destinations', { query: 'Hà Nội' }, 'search'),
      call('get_my_trips', {}, 'trips'), call('save_trip', {}, 'unknown')], 'Đã kiểm tra.']);
    const result = await h.service.chat(authenticatedUserId, { message: 'Tìm địa điểm và chuyến đi của tôi' });
    const outputs = toolOutputs(provider, h.requests[1]);
    assert.equal(outputs.length, 3);
    assert.equal(outputs[0].destinations[0].id, 9);
    assert.deepEqual(outputs[1].trips, []);
    assert.ok(outputs[2].error);
    assert.equal(h.repository.findUserTripsForChat.mock.calls.length, 2);
    assert.equal(h.repository.findUserTripsForChat.mock.calls[1].arguments[0], authenticatedUserId);
    assert.equal(result.draft, null);
    assert.equal(h.saveTripCallCount, 0);
  });

  test(`${provider}: date follow-up preserves current planning people and budget constraints`, async () => {
    const h = harness(provider, [[prepare()], 'Sẵn sàng.']);
    const result = await h.service.chat(authenticatedUserId, { message: '20 tháng 10 năm 2026', history: [
      { role: 'user', content: 'Lập lịch trình Hà Nội 1 ngày, cho 3 người, ngân sách thấp, thích văn hóa' },
      { role: 'assistant', content: 'Bạn bắt đầu ngày nào?' },
    ] });
    assert.equal(result.draft.tripDraft.startDate, '2026-10-20');
    assert.equal(result.draft.itinerary.numberOfPeople, 3);
    assert.equal(result.draft.budgetLevel, 'LOW');
    const generation = h.requests.find((request) => request.generation);
    assert.match(JSON.stringify(generation.body), /thích văn hóa/);
  });

  test(`${provider}: does not revive an old plan after an unrelated dated question`, async () => {
    const h = harness(provider, [[prepare()], 'Đây là câu trả lời.']);
    const result = await h.service.chat(authenticatedUserId, { message: 'Văn Miếu mở cửa ngày 2026-10-20 không?', history: [
      { role: 'user', content: planMessage }, { role: 'assistant', content: 'Đã tạo bản nháp.' },
    ] });
    assert.equal(result.draft, null);
    assert.equal(h.requests.filter((request) => request.generation).length, 0);
  });

  test(`${provider}: catalog search failure is a controlled response without leaking database details`, async () => {
    const h = harness(provider, [[call('search_destinations', { query: 'Hà Nội' })], 'Chưa thể tra cứu địa điểm.'], {
      repository: { findDestinationsForChat: test.mock.fn(async () => { throw new Error('database-secret-host'); }) },
    });
    const result = await h.service.chat(authenticatedUserId, { message: 'Tìm địa điểm Hà Nội' });
    assert.equal(result.draft, null);
    assert.deepEqual(result.sources, []);
    assert.doesNotMatch(JSON.stringify(result) + JSON.stringify(h.requests), /database-secret-host/);
    assert.match(JSON.stringify(toolOutputs(provider, h.requests.at(-1))), /error/i);
  });

  test(`${provider}: empty planning catalog yields no draft and a recoverable tool error`, async () => {
    const h = harness(provider, [[prepare()], 'Chưa có dữ liệu để lập lịch trình.'], {
      repository: { findActiveDestinations: test.mock.fn(async () => []) },
    });
    const result = await h.service.chat(authenticatedUserId, { message: planMessage });
    assert.equal(result.draft, null);
    assert.match(JSON.stringify(toolOutputs(provider, h.requests.at(-1))), /error/i);
    assert.equal(h.saveTripCallCount, 0);
  });

  test(`${provider}: invalid prepare arguments never reach itinerary generation`, async () => {
    const h = harness(provider, [[prepare('2026-10-20', { days: 15, userId: 999 })], 'Thông tin chưa hợp lệ.']);
    const result = await h.service.chat(authenticatedUserId, { message: planMessage });
    assert.equal(result.draft, null);
    assert.equal(h.requests.filter((request) => request.generation).length, 0);
    assert.match(JSON.stringify(toolOutputs(provider, h.requests.at(-1))), /error/i);
  });
}

test('Gemini uses its dedicated chat model while generating itineraries with low thinking on the planner model', async () => {
  const h = harness('gemini', [[prepare()], 'Sẵn sàng.']);
  const result = await h.service.chat(authenticatedUserId, { message: planMessage });
  assert.equal(result.metadata.model, 'gemini-chat-test');
  assert.match(h.requests[0].url, /gemini-chat-test:generateContent$/);
  const generation = h.requests.find((request) => request.generation);
  assert.match(generation.url, /gemini-3\.5-flash:generateContent$/);
  assert.deepEqual(generation.body.generationConfig.thinkingConfig, { thinkingLevel: 'low' });
});

test('Gemini chat falls back to the planner model and applies low thinking when no chat model is configured', async () => {
  const h = harness('gemini', [], { config: { chatModel: '' } });
  const result = await h.service.chat(authenticatedUserId, { message: 'Xin chào' });
  assert.equal(result.metadata.model, 'gemini-3.5-flash');
  assert.deepEqual(h.requests[0].body.generationConfig.thinkingConfig, { thinkingLevel: 'low' });
});
