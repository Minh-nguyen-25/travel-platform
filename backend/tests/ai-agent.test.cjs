const assert = require('node:assert/strict');
const test = require('node:test');

process.env.JWT_SECRET ||= 'ai-agent-test-secret';

const { AiService } = require('../dist/src/services/ai.service.js');
const { verifyAiDraftProof } = require('../dist/src/utils/ai-draft.utils.js');

const decimal = (value) => ({ toNumber: () => value });
const place = {
  id: 17,
  name: 'Biển Mỹ Khê',
  address: 'Đà Nẵng',
  description: 'Tắm biển',
  latitude: decimal(16.05),
  longitude: decimal(108.24),
  ticketPrice: decimal(0),
  openingHoursNote: null,
  visitDuration: 90,
  rating: decimal(4.2),
  categories: [],
};
const config = {
  provider: 'openai', apiKey: 'test-key', model: 'test-model',
  baseUrl: 'https://api.openai.test/v1', timeoutMs: 1000, maxRetries: 0,
  maxOutputTokens: 4000, maxDestinationCandidates: 10, routingEnabled: false,
  maxRoutingLegs: 12, routingConcurrency: 2, routingDeadlineMs: 15000,
  openAiOrganization: null, openAiProject: null,
};
const jsonResponse = (payload) => new Response(JSON.stringify(payload), {
  status: 200, headers: { 'content-type': 'application/json' },
});
const messageResponse = (text) => jsonResponse({
  output: [{ type: 'message', content: [{ type: 'output_text', text }] }],
});

test('OpenAI agent searches on demand and replays tool output before answering', async () => {
  const initialPlaces = Array.from({ length: 10 }, (_, index) => ({
    ...place, id: index + 1, name: `Địa điểm ${index + 1}`,
  }));
  const repository = {
    findPreference: async () => null,
    findUserTripsForChat: async () => [],
    findDestinationsForChat: async (query) => query === 'biển Mỹ Khê' ? [place] : initialPlaces,
    findActiveDestinations: async () => [],
  };
  const requests = [];
  const fetchMock = async (_url, init) => {
    const body = JSON.parse(init.body);
    requests.push(body);
    if (requests.length === 1) return jsonResponse({ output: [
      { type: 'function_call', name: 'search_destinations', call_id: 'call-search', arguments: '{"query":"biển Mỹ Khê"}' },
    ] });
    return messageResponse('Bạn có thể đến Biển Mỹ Khê.');
  };
  const service = new AiService(repository, {}, () => config, fetchMock);
  const result = await service.chat(7, { message: 'Gợi ý bãi biển ở Đà Nẵng' });

  assert.equal(result.reply, 'Bạn có thể đến Biển Mỹ Khê.');
  assert.equal(result.sources[0].id, 17);
  assert.equal(result.sources.length, 11);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].tools.some(({ name }) => name === 'search_destinations'), true);
  assert.equal(requests[1].tools.some(({ name }) => name === 'prepare_itinerary'), true);
  const output = requests[1].input.find(({ type }) => type === 'function_call_output');
  assert.equal(output.call_id, 'call-search');
  assert.equal(JSON.parse(output.output).destinations[0].id, 17);
});

test('Gemini chat uses retrieved TravelPlatform places and preserves the chat response contract', async () => {
  const repository = {
    findPreference: async () => null,
    findUserTripsForChat: async () => [],
    findDestinationsForChat: async () => [place],
    findActiveDestinations: async () => [],
  };
  const requests = [];
  const geminiConfig = { ...config, provider: 'gemini', model: 'gemini-test-model',
    baseUrl: 'https://gemini.example.test/v1beta' };
  const fetchMock = async (url, init) => {
    requests.push({ url: String(url), headers: init.headers, body: JSON.parse(init.body) });
    return jsonResponse({ candidates: [{ content: { parts: [{ text: 'Biển Mỹ Khê phù hợp.' }] } }] });
  };
  const service = new AiService(repository, {}, () => geminiConfig, fetchMock);
  const result = await service.chat(7, { message: 'Gợi ý biển Mỹ Khê',
    history: [{ role: 'user', content: 'Tôi thích biển' }, { role: 'assistant', content: 'Đã hiểu' }] });

  assert.equal(result.reply, 'Biển Mỹ Khê phù hợp.');
  assert.equal(result.metadata.provider, 'gemini');
  assert.deepEqual(result.sources, [{ id: 17, name: place.name }]);
  assert.equal(result.draft, null);
  assert.equal(requests.length, 1);
  assert.match(requests[0].url, /gemini-test-model:generateContent$/);
  assert.equal(requests[0].body.contents[1].role, 'model');
  assert.match(requests[0].body.contents[2].parts[0].text, /Biển Mỹ Khê/);
});

test('Gemini 3.5 Flash chat uses low thinking on every agent turn', async () => {
  const repository = {
    findPreference: async () => null,
    findUserTripsForChat: async () => [],
    findDestinationsForChat: async () => [],
    findActiveDestinations: async () => [],
  };
  const requests = [];
  const geminiConfig = { ...config, provider: 'gemini', model: 'gemini-3.5-flash',
    baseUrl: 'https://gemini.example.test/v1beta' };
  const fetchMock = async (_url, init) => {
    requests.push(JSON.parse(init.body));
    if (requests.length === 1) return jsonResponse({ candidates: [{ content: { role: 'model', parts: [
      { functionCall: { id: 'call-trips', name: 'get_my_trips', args: {} } },
    ] } }] });
    return jsonResponse({ candidates: [{ content: { role: 'model', parts: [{ text: 'Chào bạn.' }] } }] });
  };
  const service = new AiService(repository, {}, () => geminiConfig, fetchMock);
  const result = await service.chat(7, { message: 'Xem chuyến đi của tôi' });

  assert.equal(result.reply, 'Chào bạn.');
  assert.equal(requests.length, 2);
  for (const request of requests) {
    assert.equal(request.generationConfig.thinkingConfig.thinkingLevel, 'low');
  }
});

test('Gemini chat can use Flash-Lite while the planner remains on Flash', async () => {
  const repository = {
    findPreference: async () => null,
    findUserTripsForChat: async () => [],
    findDestinationsForChat: async () => [place],
    findActiveDestinations: async () => [],
  };
  const requests = [];
  const geminiConfig = { ...config, provider: 'gemini', model: 'gemini-3.5-flash',
    chatModel: 'gemini-3.5-flash-lite', baseUrl: 'https://gemini.example.test/v1beta' };
  const service = new AiService(repository, {}, () => geminiConfig, async (url, init) => {
    requests.push({ url: String(url), body: JSON.parse(init.body) });
    return jsonResponse({ candidates: [{ content: { role: 'model', parts: [{ text: 'Biển Mỹ Khê.' }] } }] });
  });
  const result = await service.chat(7, { message: 'Gợi ý biển ở Đà Nẵng' });

  assert.match(requests[0].url, /gemini-3\.5-flash-lite:generateContent$/);
  assert.equal(requests[0].body.generationConfig.thinkingConfig, undefined);
  assert.equal(result.metadata.model, 'gemini-3.5-flash-lite');
});

test('Gemini can search the catalog on demand and replay a function response', async () => {
  const repository = {
    findPreference: async () => null,
    findUserTripsForChat: async () => [],
    findDestinationsForChat: async (query) => query === 'Biển Mỹ Khê' ? [place] : [],
    findActiveDestinations: async () => [],
  };
  const requests = [];
  const geminiConfig = { ...config, provider: 'gemini', model: 'gemini-test-model',
    baseUrl: 'https://gemini.example.test/v1beta' };
  const fetchMock = async (_url, init) => {
    const body = JSON.parse(init.body);
    requests.push(body);
    if (requests.length === 1) return jsonResponse({ candidates: [{ content: { role: 'model', parts: [
      { thoughtSignature: 'model-signature',
        functionCall: { id: 'call-search', name: 'search_destinations', args: { query: 'Biển Mỹ Khê' } } },
    ] } }] });
    return jsonResponse({ candidates: [{ content: { role: 'model', parts: [{ text: 'Bạn có thể đến Biển Mỹ Khê.' }] } }] });
  };
  const service = new AiService(repository, {}, () => geminiConfig, fetchMock);
  const result = await service.chat(7, { message: 'Gợi ý bãi biển ở Đà Nẵng' });

  assert.equal(result.reply, 'Bạn có thể đến Biển Mỹ Khê.');
  assert.deepEqual(result.sources, [{ id: 17, name: place.name }]);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].tools[0].functionDeclarations.some(({ name }) => name === 'search_destinations'), true);
  assert.equal(requests[1].contents.at(-2).parts[0].thoughtSignature, 'model-signature');
  const output = requests[1].contents.at(-1).parts[0].functionResponse;
  assert.equal(output.id, 'call-search');
  assert.equal(output.response.destinations[0].id, 17);
});

test('Gemini does not create a trip draft for a model-invented start date', async () => {
  const repository = {
    findPreference: async () => null,
    findUserTripsForChat: async () => [],
    findDestinationsForChat: async () => [],
    findActiveDestinations: async () => { throw new Error('Generation must not run'); },
  };
  const requests = [];
  const geminiConfig = { ...config, provider: 'gemini', model: 'gemini-test-model',
    baseUrl: 'https://gemini.example.test/v1beta' };
  const fetchMock = async (_url, init) => {
    const body = JSON.parse(init.body);
    requests.push(body);
    if (requests.length === 1) return jsonResponse({ candidates: [{ content: { role: 'model', parts: [
      { functionCall: { id: 'call-plan', name: 'prepare_itinerary',
        args: { destinationCity: 'Đà Nẵng', days: 1, startDate: '2026-09-20' } } },
    ] } }] });
    return jsonResponse({ candidates: [{ content: { role: 'model', parts: [{ text: 'Bạn muốn bắt đầu ngày nào?' }] } }] });
  };
  const service = new AiService(repository, {}, () => geminiConfig, fetchMock);
  const result = await service.chat(7, { message: 'Lập lịch Đà Nẵng một ngày' });

  assert.equal(result.draft, null);
  assert.equal(requests.length, 2);
  assert.match(JSON.stringify(requests[1].contents.at(-1)), /Người dùng chưa cung cấp ngày bắt đầu/);
});

test('Gemini does not reuse an old trip date for a new destination request', async () => {
  const repository = {
    findPreference: async () => null,
    findUserTripsForChat: async () => [],
    findDestinationsForChat: async () => [],
    findActiveDestinations: async () => { throw new Error('Old date must not authorize generation'); },
  };
  const requests = [];
  const geminiConfig = { ...config, provider: 'gemini', model: 'gemini-test-model',
    baseUrl: 'https://gemini.example.test/v1beta' };
  const fetchMock = async (_url, init) => {
    const body = JSON.parse(init.body);
    requests.push(body);
    if (requests.length === 1) return jsonResponse({ candidates: [{ content: { role: 'model', parts: [
      { functionCall: { id: 'call-new-plan', name: 'prepare_itinerary',
        args: { destinationCity: 'Hà Nội', days: 1, startDate: '2026-09-20' } } },
    ] } }] });
    return jsonResponse({ candidates: [{ content: { role: 'model', parts: [{ text: 'Bạn muốn bắt đầu ngày nào?' }] } }] });
  };
  const service = new AiService(repository, {}, () => geminiConfig, fetchMock);
  const result = await service.chat(7, { message: 'Lập lịch Hà Nội một ngày',
    history: [{ role: 'user', content: 'Lập lịch Huế một ngày 20/9/2026' },
      { role: 'assistant', content: 'Đây là lịch trình Huế.' }] });

  assert.equal(result.draft, null);
  assert.equal(requests.length, 2);
  assert.match(JSON.stringify(requests[1].contents.at(-1)), /chưa cung cấp ngày bắt đầu/);
});

test('Gemini ignores an unrelated dated message after an earlier itinerary', async () => {
  const repository = {
    findPreference: async () => null,
    findUserTripsForChat: async () => [],
    findDestinationsForChat: async () => [],
    findActiveDestinations: async () => { throw new Error('Unrelated chat must not authorize generation'); },
  };
  const requests = [];
  const geminiConfig = { ...config, provider: 'gemini', model: 'gemini-test-model',
    baseUrl: 'https://gemini.example.test/v1beta' };
  const fetchMock = async (_url, init) => {
    const body = JSON.parse(init.body);
    requests.push(body);
    if (requests.length === 1) return jsonResponse({ candidates: [{ content: { role: 'model', parts: [
      { functionCall: { id: 'call-old-plan', name: 'prepare_itinerary',
        args: { destinationCity: 'Huế', days: 1, startDate: '2026-09-20' } } },
    ] } }] });
    return jsonResponse({ candidates: [{ content: { role: 'model', parts: [{ text: 'Tôi sẽ trả lời câu hỏi mới.' }] } }] });
  };
  const service = new AiService(repository, {}, () => geminiConfig, fetchMock);
  const result = await service.chat(7, { message: '20/9/2026 tôi thích ăn ở Hà Nội',
    history: [{ role: 'user', content: 'Lập lịch Huế một ngày 20/9/2026' },
      { role: 'assistant', content: 'Đây là lịch trình Huế.' }] });

  assert.equal(result.draft, null);
  assert.equal(requests.length, 2);
  assert.match(JSON.stringify(requests[1].contents.at(-1)), /chưa yêu cầu lập lịch trình/);
});

test('Gemini trip lookup uses the authenticated user id', async () => {
  const lookedUpUsers = [];
  const repository = {
    findPreference: async () => null,
    findUserTripsForChat: async (userId) => { lookedUpUsers.push(userId); return []; },
    findDestinationsForChat: async () => [],
    findActiveDestinations: async () => [],
  };
  const requests = [];
  const geminiConfig = { ...config, provider: 'gemini', model: 'gemini-test-model',
    baseUrl: 'https://gemini.example.test/v1beta' };
  const fetchMock = async (_url, init) => {
    const body = JSON.parse(init.body);
    requests.push(body);
    if (requests.length === 1) return jsonResponse({ candidates: [{ content: { role: 'model', parts: [
      { functionCall: { id: 'call-trips', name: 'get_my_trips', args: {} } },
    ] } }] });
    return jsonResponse({ candidates: [{ content: { role: 'model', parts: [{ text: 'Bạn chưa lưu chuyến đi.' }] } }] });
  };
  const service = new AiService(repository, {}, () => geminiConfig, fetchMock);
  const result = await service.chat(7, { message: 'Xem chuyến đi của tôi' });

  assert.equal(result.reply, 'Bạn chưa lưu chuyến đi.');
  assert.deepEqual(lookedUpUsers, [7, 7]);
  assert.deepEqual(requests[1].contents.at(-1).parts[0].functionResponse.response.trips, []);
});

test('Gemini prepares a signed draft using chat constraints and never saves before review', async () => {
  const repository = {
    findPreference: async () => null,
    findUserTripsForChat: async () => [],
    findDestinationsForChat: async () => [],
    findActiveDestinations: async () => [place],
  };
  const requests = [];
  const geminiConfig = { ...config, provider: 'gemini', model: 'gemini-test-model',
    baseUrl: 'https://gemini.example.test/v1beta' };
  const fetchMock = async (_url, init) => {
    const body = JSON.parse(init.body);
    requests.push(body);
    if (body.generationConfig?.responseMimeType) return jsonResponse({ candidates: [{ content: {
      parts: [{ text: JSON.stringify({ title: 'Một ngày Đà Nẵng', summary: 'Đi biển Mỹ Khê',
        days: [{ dayNumber: 1, theme: 'Biển', note: '', activities: [{ destinationId: 17,
          startTime: '09:00', endTime: '10:30', estimatedCost: 0, travelMode: 'WALKING', note: 'Tắm biển' }] }] }) }],
    } }] });
    if (requests.length === 1) return jsonResponse({ candidates: [{ content: { role: 'model', parts: [
      { functionCall: { id: 'call-plan', name: 'prepare_itinerary',
        args: { destinationCity: 'Đà Nẵng', days: 1, startDate: '2026-09-20' } } },
    ] } }] });
    return jsonResponse({ candidates: [{ content: { role: 'model', parts: [{ text: 'Đây là bản nháp để bạn xem.' }] } }] });
  };
  const service = new AiService(repository, {}, () => geminiConfig, fetchMock);
  const result = await service.chat(7, { message: '20 tháng 9 năm 2026 cho 4 người',
    history: [{ role: 'user', content: 'Lập lịch Đà Nẵng một ngày, ngân sách thấp' },
      { role: 'assistant', content: 'Bạn muốn bắt đầu ngày nào và đi mấy người?' }] });

  assert.equal(result.draft.tripDraft.numberOfPeople, 4);
  assert.equal(result.draft.budgetLevel, 'LOW');
  assert.equal(result.draft.tripDraft.startDate, '2026-09-20');
  const { aiRawData, aiProofToken, ...tripInput } = result.draft.tripDraft;
  assert.equal(verifyAiDraftProof(aiProofToken, 7, tripInput, aiRawData), true);
  assert.equal(requests.length, 3);
  const output = requests[2].contents.at(-1).parts[0].functionResponse;
  assert.equal(output.id, 'call-plan');
  assert.equal(output.response.title, 'Một ngày Đà Nẵng');
  assert.equal(JSON.stringify(output).includes(aiProofToken), false);
});

test('OpenAI agent prepares a signed draft for review without saving a trip', async () => {
  const repository = {
    findPreference: async () => null,
    findUserTripsForChat: async () => [],
    findDestinationsForChat: async () => [],
    findActiveDestinations: async () => [place],
  };
  const requests = [];
  const fetchMock = async (_url, init) => {
    const body = JSON.parse(init.body);
    requests.push(body);
    if (body.text?.format?.name === 'travel_itinerary') return jsonResponse({
      output_text: JSON.stringify({
        title: 'Một ngày Đà Nẵng', summary: 'Đi biển Mỹ Khê', days: [{
          dayNumber: 1, theme: 'Biển', note: '', activities: [{
            destinationId: 17, startTime: '09:00', endTime: '10:30',
            estimatedCost: 0, travelMode: 'WALKING', note: 'Tắm biển',
          }],
        }],
      }),
    });
    if (requests.length === 1) return jsonResponse({ output: [
      { type: 'function_call', name: 'prepare_itinerary', call_id: 'call-plan',
        arguments: '{"destinationCity":"Đà Nẵng","days":1,"startDate":"2026-09-20"}' },
    ] });
    return messageResponse('Mình đã chuẩn bị lịch trình một ngày để bạn xem trước.');
  };
  const service = new AiService(repository, {}, () => config, fetchMock);
  const result = await service.chat(7, { message: 'Lập lịch Đà Nẵng ngày 20/9/2026' });

  assert.equal(result.draft.itinerary.days[0].activities[0].destinationId, 17);
  assert.deepEqual(result.sources, [{ id: 17, name: 'Biển Mỹ Khê' }]);
  assert.equal(result.draft.tripDraft.startDate, '2026-09-20');
  const { aiRawData, aiProofToken, ...tripInput } = result.draft.tripDraft;
  assert.equal(verifyAiDraftProof(aiProofToken, 7, tripInput, aiRawData), true);
  assert.equal(requests.length, 3);
  const continuation = requests[2].input.find(({ type }) => type === 'function_call_output');
  assert.equal(JSON.parse(continuation.output).title, 'Một ngày Đà Nẵng');
  assert.equal(continuation.output.includes(aiProofToken), false);
});

test('OpenAI agent cannot invent a start date the user did not provide', async () => {
  const repository = {
    findPreference: async () => null,
    findUserTripsForChat: async () => [],
    findDestinationsForChat: async () => [],
    findActiveDestinations: async () => [place],
  };
  const requests = [];
  const fetchMock = async (_url, init) => {
    const body = JSON.parse(init.body);
    requests.push(body);
    if (body.text?.format?.name === 'travel_itinerary') {
      throw new Error('A plan must not be generated without the user date');
    }
    if (requests.length === 1) return jsonResponse({ output: [
      { type: 'function_call', name: 'prepare_itinerary', call_id: 'call-plan',
        arguments: '{"destinationCity":"Đà Nẵng","days":1,"startDate":"2026-09-20"}' },
    ] });
    return messageResponse('Bạn muốn bắt đầu chuyến đi ngày nào?');
  };
  const service = new AiService(repository, {}, () => config, fetchMock);
  const result = await service.chat(7, { message: 'Lập lịch Đà Nẵng một ngày' });

  assert.equal(result.draft, null);
  assert.equal(requests.length, 2);
  assert.match(requests[1].input.find(({ type }) => type === 'function_call_output').output, /ngày bắt đầu/i);
});

test('OpenAI does not reuse a prior trip date for a new request', async () => {
  const repository = {
    findPreference: async () => null,
    findUserTripsForChat: async () => [],
    findDestinationsForChat: async () => [],
    findActiveDestinations: async () => { throw new Error('Old date must not authorize generation'); },
  };
  const requests = [];
  const fetchMock = async (_url, init) => {
    const body = JSON.parse(init.body);
    requests.push(body);
    if (requests.length === 1) return jsonResponse({ output: [
      { type: 'function_call', name: 'prepare_itinerary', call_id: 'call-new-plan',
        arguments: '{"destinationCity":"Hà Nội","days":1,"startDate":"2026-09-20"}' },
    ] });
    return messageResponse('Bạn muốn bắt đầu ngày nào?');
  };
  const service = new AiService(repository, {}, () => config, fetchMock);
  const result = await service.chat(7, { message: 'Lập lịch Hà Nội một ngày',
    history: [{ role: 'user', content: 'Lập lịch Huế một ngày 20/9/2026' },
      { role: 'assistant', content: 'Đây là lịch trình Huế.' }] });

  assert.equal(result.draft, null);
  assert.equal(requests.length, 2);
  assert.match(requests[1].input.find(({ type }) => type === 'function_call_output').output,
    /chưa cung cấp ngày bắt đầu/);
});

test('OpenAI agent can search first, then prepare a draft using a second tool turn', async () => {
  const repository = {
    findPreference: async () => null,
    findUserTripsForChat: async () => [],
    findDestinationsForChat: async () => [place],
    findActiveDestinations: async () => [place],
  };
  const requests = [];
  let chatTurns = 0;
  const fetchMock = async (_url, init) => {
    const body = JSON.parse(init.body);
    requests.push(body);
    if (body.text?.format?.name === 'travel_itinerary') return jsonResponse({
      output_text: JSON.stringify({
        title: 'Mỹ Khê trong ngày', summary: 'Một ngày ở biển',
        days: [{ dayNumber: 1, theme: 'Biển', note: '', activities: [{
          destinationId: 17, startTime: '09:00', endTime: '10:30',
          estimatedCost: 0, travelMode: 'WALKING', note: 'Tắm biển',
        }] }],
      }),
    });
    chatTurns += 1;
    if (chatTurns === 1) return jsonResponse({ output: [
      { type: 'function_call', name: 'search_destinations', call_id: 'call-search',
        arguments: '{"query":"Biển Mỹ Khê"}' },
    ] });
    if (chatTurns === 2) return jsonResponse({ output: [
      { type: 'function_call', name: 'prepare_itinerary', call_id: 'call-plan',
        arguments: '{"destinationCity":"Đà Nẵng","days":1,"startDate":"2026-09-20"}' },
    ] });
    return messageResponse('Đây là bản nháp để bạn xem.');
  };
  const service = new AiService(repository, {}, () => config, fetchMock);
  const result = await service.chat(7, { message: 'Lập lịch Đà Nẵng 20/9/2026, thích biển' });

  assert.equal(result.draft.itinerary.title, 'Mỹ Khê trong ngày');
  assert.equal(result.reply, 'Đây là bản nháp để bạn xem.');
  assert.equal(requests.length, 4);
  assert.equal(requests[3].tool_choice, 'none');
  assert.equal(requests[3].input.filter(({ type }) => type === 'function_call_output').length, 2);
});

test('OpenAI agent reports missing catalog places instead of failing the whole chat', async () => {
  const repository = {
    findPreference: async () => null,
    findUserTripsForChat: async () => [],
    findDestinationsForChat: async () => [],
    findActiveDestinations: async () => [],
  };
  const requests = [];
  const fetchMock = async (_url, init) => {
    const body = JSON.parse(init.body);
    requests.push(body);
    if (requests.length === 1) return jsonResponse({ output: [
      { type: 'function_call', name: 'prepare_itinerary', call_id: 'call-plan',
        arguments: '{"destinationCity":"Đà Nẵng","days":1,"startDate":"2026-09-20"}' },
    ] });
    return messageResponse('Chưa có địa điểm tại Đà Nẵng để lập lịch trình.');
  };
  const service = new AiService(repository, {}, () => config, fetchMock);
  const result = await service.chat(7, { message: 'Lập lịch Đà Nẵng 20/9/2026' });

  assert.equal(result.draft, null);
  assert.equal(result.reply, 'Chưa có địa điểm tại Đà Nẵng để lập lịch trình.');
  assert.equal(requests.length, 2);
  assert.match(requests[1].input.find(({ type }) => type === 'function_call_output').output, /Chưa có địa điểm/);
});

test('OpenAI agent accepts a date supplied in a normal planning follow-up', async () => {
  const repository = {
    findPreference: async () => null,
    findUserTripsForChat: async () => [],
    findDestinationsForChat: async () => [],
    findActiveDestinations: async () => [place],
  };
  const requests = [];
  const fetchMock = async (_url, init) => {
    const body = JSON.parse(init.body);
    requests.push(body);
    if (body.text?.format?.name === 'travel_itinerary') return jsonResponse({
      output_text: JSON.stringify({
        title: 'Đà Nẵng trong ngày', summary: 'Một ngày ở biển',
        days: [{ dayNumber: 1, theme: 'Biển', note: '', activities: [{
          destinationId: 17, startTime: '09:00', endTime: '10:30',
          estimatedCost: 0, travelMode: 'WALKING', note: 'Tắm biển',
        }] }],
      }),
    });
    if (requests.length === 1) return jsonResponse({ output: [
      { type: 'function_call', name: 'prepare_itinerary', call_id: 'call-plan',
        arguments: '{"destinationCity":"Đà Nẵng","days":1,"startDate":"2026-09-20"}' },
    ] });
    return messageResponse('Đây là lịch trình để bạn xem.');
  };
  const service = new AiService(repository, {}, () => config, fetchMock);
  const result = await service.chat(7, {
    message: '20 tháng 9 năm 2026',
    history: [{ role: 'user', content: 'Lập lịch Đà Nẵng một ngày, thích biển' },
      { role: 'assistant', content: 'Có bao nhiêu người?' },
      { role: 'user', content: 'Cho 4 người, ngân sách thấp' },
      { role: 'assistant', content: 'Bạn muốn bắt đầu ngày nào?' }],
  });

  assert.equal(result.draft.tripDraft.startDate, '2026-09-20');
  assert.equal(result.draft.tripDraft.numberOfPeople, 4);
  assert.equal(result.draft.budgetLevel, 'LOW');
  const generation = requests.find(({ text }) => text?.format?.name === 'travel_itinerary');
  assert.match(JSON.stringify(generation), /thích biển/);
  assert.equal(requests.length, 3);
});

test('a party-size answer keeps the date from the active planning request', async () => {
  const repository = {
    findPreference: async () => null,
    findUserTripsForChat: async () => [],
    findDestinationsForChat: async () => [],
  };
  const requests = [];
  const fetchMock = async (_url, init) => {
    requests.push(JSON.parse(init.body));
    if (requests.length === 1) return jsonResponse({ output: [{
      type: 'function_call', name: 'prepare_itinerary', call_id: 'call-plan',
      arguments: '{"destinationCity":"Đà Nẵng","days":1,"startDate":"2026-09-20"}',
    }] });
    return messageResponse('Đây là bản nháp để bạn xem.');
  };
  const service = new AiService(repository, {}, () => config, fetchMock);
  let generatedInput;
  service.generateItinerary = async (_userId, input) => {
    generatedInput = input;
    return { itinerary: { title: 'Đà Nẵng', summary: 'Một ngày',
      days: [{ dayNumber: 1, date: '2026-09-20', activities: [] }], totalEstimatedCost: 0 },
      tripDraft: { startDate: '2026-09-20', numberOfPeople: input.numberOfPeople }, warnings: [] };
  };
  const result = await service.chat(7, { message: '4 người',
    history: [{ role: 'user', content: 'Lập lịch Đà Nẵng một ngày 20/9/2026' },
      { role: 'assistant', content: 'Chuyến đi có bao nhiêu người?' }] });
  assert.ok(generatedInput, 'the active dated plan should reach generation');
  assert.equal(generatedInput.startDate, '2026-09-20');
  assert.equal(generatedInput.numberOfPeople, 4);
  assert.equal(result.draft.tripDraft.startDate, '2026-09-20');
});
