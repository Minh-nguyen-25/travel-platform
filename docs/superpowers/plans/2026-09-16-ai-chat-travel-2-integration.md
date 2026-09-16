# Travel_2 AI Chat Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tích hợp chọn lọc AI Chat agent, tìm kiếm địa điểm và bản nháp lịch trình từ working tree `Travel_2` mà không làm mất các thay đổi mới hơn trong dự án đích.

**Architecture:** Giữ nguyên endpoint AI hiện có, mở rộng service thành agent có ba công cụ backend được xác thực chặt. Repository chỉ truy xuất dữ liệu phù hợp, service điều phối tool calling và trả `sources`/`draft`, cò frontend chỉ lưu chuyến khi người dùng bấm xác nhận.

**Tech Stack:** TypeScript, Node.js, Express, Prisma/PostgreSQL, Zod, React 18, React Router, Tailwind CSS, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-16-ai-chat-travel-2-integration-design.md`

## Global Constraints

- Không sao chép `backend/.env`, `frontend/.env`, API key, secret, `dist` hoặc `node_modules` từ `Travel_2`.
- Không ghi đè các tính năng mới hơn trong dự án đích; chỉ tích hợp các thay đổi AI Chat đã duyệt.
- Giữ nguyên endpoint `/ai/chat`, `/ai/generate-itinerary` và `/trips`.
- Tool calling có tối đa hai vòng và tối đa ba lời gọi công cụ mỗi vòng.
- `prepare_itinerary` không được tự lưu chuyến đi và không được dùng ngày do model tự suy diễn.
- Mọi tính năng được thực hiện theo chu trình test đỏ → mã tối thiểu → test xanh.

---

## File Map

- `backend/src/config/ai.ts`: đọc provider, planner model và chat model.
- `backend/.env.example`: tài liệu cấu hình AI không chứa secret.
- `backend/src/utils/ai-search.ts`: chuẩn hóa từ khóa và xếp hạng địa điểm.
- `backend/src/repositories/ai.repository.ts`: truy vấn địa điểm phù hợp và dữ liệu chat.
- `backend/src/services/ai.service.ts`: điều phối OpenAI/Gemini, công cụ và bản nháp.
- `backend/src/types/ai.types.ts`: hợp đồng `AiChatResult` phía server.
- `frontend/src/types/ai.types.ts`: hợp đồng `AiChatResult` phía client.
- `frontend/src/components/ai/AiDraftPreview.tsx`: component thuần hiển thị bản nháp.
- `frontend/src/pages/client/AiChatPage.tsx`: nguồn tham khảo, trạng thái bản nháp và thao tác lưu.
- `backend/tests/ai-provider.test.cjs`: hành vi cấu hình provider/model.
- `backend/tests/ai-search.test.cjs`: chuẩn hóa và xếp hạng trong bộ nhớ.
- `backend/tests/ai-repository.test.cjs`: SQL truy xuất địa điểm.
- `backend/tests/ai-agent.test.cjs`: giao thức agent/tool calling.
- `backend/tests/backend.smoke.test.cjs`: hợp đồng smoke test cập nhật.
- `frontend/tests/ai-draft-preview.test.mjs`: bản xem trước và không lộ proof.

---

### Task 1: Cấu hình provider và model chat riêng

**Files:**
- Modify: `backend/.env.example`
- Modify: `backend/src/config/ai.ts`
- Create: `backend/tests/ai-provider.test.cjs`

**Interfaces:**
- Produces: `AiConfig.chatModel: string`.
- Produces: `getAiConfig()` chọn Gemini mặc định, cho phép OpenAI opt-in và đọc `GEMINI_CHAT_MODEL` riêng.

- [ ] **Step 1: Viết test đỏ cho provider và chat model**

Tích hợp `backend/tests/ai-provider.test.cjs` từ `Travel_2`, trong đó các assertion cốt lõi là:

```js
assert.equal(config.provider, 'gemini');
assert.equal(config.model, 'gemini-3.5-flash');
assert.equal(config.chatModel, 'gemini-3.5-flash-lite');

process.env.AI_PROVIDER = 'openai';
assert.equal(getAiConfig().provider, 'openai');

process.env.AI_PROVIDER = 'gemini';
process.env.GEMINI_CHAT_MODEL = 'gemini-custom-chat';
assert.equal(getAiConfig().chatModel, 'gemini-custom-chat');
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

Run: `cd backend && npm run build && node --test tests/ai-provider.test.cjs`

Expected: FAIL vì `chatModel` chưa tồn tại và provider mặc định chưa khớp.

- [ ] **Step 3: Mở rộng cấu hình**

Trong `backend/src/config/ai.ts`, bổ sung:

```ts
export interface AiConfig {
  provider: AiProvider;
  apiKey: string;
  model: string;
  chatModel: string;
  baseUrl: string;
  timeoutMs: number;
  maxRetries: number;
  maxOutputTokens: number;
  openAiOrganization?: string;
  openAiProject?: string;
}

const chatModel = isOpenAi
  ? model
  : (process.env.GEMINI_CHAT_MODEL ??
    (model === 'gemini-3.5-flash' ? 'gemini-3.5-flash-lite' : model)).trim();
```

Trả `chatModel` từ `getAiConfig()`, kiểm tra chuỗi rỗng, và cập nhật `.env.example` với `GEMINI_CHAT_MODEL=gemini-3.5-flash-lite`. Không sao chép `.env` thật.

- [ ] **Step 4: Chạy lại test**

Run: `cd backend && npm run build && node --test tests/ai-provider.test.cjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/.env.example backend/src/config/ai.ts backend/tests/ai-provider.test.cjs
git commit -m "feat(ai): configure dedicated chat model"
```

---

### Task 2: Tìm kiếm địa điểm tiếng Việt

**Files:**
- Create: `backend/src/utils/ai-search.ts`
- Modify: `backend/src/repositories/ai.repository.ts`
- Create: `backend/tests/ai-search.test.cjs`
- Create: `backend/tests/ai-repository.test.cjs`

**Interfaces:**
- Produces: `getChatSearchTerms(query: string): string[]`.
- Produces: `rankDestinationsForChat<T>(destinations: T[], query: string, limit: number): T[]`.
- Produces: `searchChatDestinations(database, query, limit): Promise<AiChatDestinationRecord[]>`.
- Changes: `AiRepository.findDestinationsForChat(query: string, limit: number)`.

- [ ] **Step 1: Viết test đỏ cho chuẩn hóa và xếp hạng**

Tích hợp `backend/tests/ai-search.test.cjs` và kiểm tra:

```js
const ranked = rankDestinationsForChat(destinations, 'bao tang dan toc hoc', 10);
assert.equal(ranked[0].name, 'Bảo tàng Dân tộc học');
assert.deepEqual(getChatSearchTerms('Gợi ý địa điểm cho mình'), []);
assert.match(VIETNAMESE_SQL_FROM, /đ/);
assert.equal(VIETNAMESE_SQL_FROM.length, VIETNAMESE_SQL_TO.length);
```

- [ ] **Step 2: Chạy test search để xác nhận thất bại**

Run: `cd backend && npm run build && node --test tests/ai-search.test.cjs`

Expected: FAIL vì `dist/src/utils/ai-search.js` chưa tồn tại.

- [ ] **Step 3: Cài đặt tiện ích search**

Tạo `backend/src/utils/ai-search.ts` với trọng số xếp hạng cố định:

```ts
const score = terms.reduce((total, term) => total +
  (name.has(term) ? 5 : 0) +
  (address.has(term) ? 4 : 0) +
  (categories.has(term) ? 3 : 0) +
  (description.has(term) ? 1 : 0), 0);
```

Chuẩn hóa NFD, loại combining marks, chuyển `đ` thành `d`, bỏ generic words, giới hạn sáu term và sắp xếp tie-break theo rating.

- [ ] **Step 4: Chạy lại test search**

Run: `cd backend && npm run build && node --test tests/ai-search.test.cjs`

Expected: PASS.

- [ ] **Step 5: Viết test đỏ cho repository**

Tích hợp `backend/tests/ai-repository.test.cjs` với database fake ghi nhận `$queryRaw` và trả về ID ngoài top-rated pool:

```js
const result = await searchChatDestinations(database, 'bao tang dan toc hoc', 10);
assert.equal(result[0].name, 'Bảo tàng Dân tộc học');
assert.equal(database.destination.findMany.mock.calls.length, 1);
```

- [ ] **Step 6: Chạy test repository để xác nhận thất bại**

Run: `cd backend && npm run build && node --test tests/ai-repository.test.cjs`

Expected: FAIL vì `searchChatDestinations` chưa được export.

- [ ] **Step 7: Tích hợp truy vấn repository**

Dùng `Prisma.sql`, `translate(normalize(lower(...), NFC), from, to)` và các trọng số giống utility. Giới hạn candidate SQL bằng:

```ts
LIMIT ${Math.max(300, Math.min(limit * 20, 600))}
```

Nếu không có term, dùng fallback `findMany` theo rating. Nếu có ID, tải candidate bằng Prisma và gọi `rankDestinationsForChat`.

- [ ] **Step 8: Chạy hai nhóm test**

Run: `cd backend && npm run build && node --test tests/ai-search.test.cjs tests/ai-repository.test.cjs`

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add backend/src/utils/ai-search.ts backend/src/repositories/ai.repository.ts backend/tests/ai-search.test.cjs backend/tests/ai-repository.test.cjs
git commit -m "feat(ai): retrieve relevant Vietnamese destinations"
```

---

### Task 3: Agent tool calling và bản nháp backend

**Files:**
- Modify: `backend/src/types/ai.types.ts`
- Modify: `backend/src/services/ai.service.ts`
- Modify: `backend/tests/backend.smoke.test.cjs`
- Create: `backend/tests/ai-agent.test.cjs`

**Interfaces:**
- Consumes: `AiConfig.chatModel` từ Task 1.
- Consumes: `AiRepository.findDestinationsForChat(query, limit)` từ Task 2.
- Produces: `AiChatResult.sources: Array<{ id: number; name: string }>`.
- Produces: `AiChatResult.draft: { itinerary; tripDraft; warnings; budgetLevel } | null`.

- [ ] **Step 1: Viết test đỏ cho hợp đồng agent**

Tích hợp `backend/tests/ai-agent.test.cjs` từ `Travel_2`. Bộ test phải bao phủ:

```js
assert.deepEqual(result.sources, [{ id: 9, name: 'Văn Miếu' }]);
assert.equal(result.draft, null);
assert.equal(repository.findUserTripsForChat.mock.calls[0].arguments[0], authenticatedUserId);
assert.equal(result.draft.tripDraft.startDate, '2026-10-20');
assert.equal(saveTripCallCount, 0);
```

Ngoài ra test cả OpenAI/Gemini search, replay tool result, Gemini low thinking, model chat riêng, chống ngày suy diễn, không tái sử dụng ngày cũ, search-then-prepare và lỗi catalog có kiểm soát.

- [ ] **Step 2: Chạy test agent để xác nhận thất bại**

Run: `cd backend && npm run build && node --test tests/ai-agent.test.cjs`

Expected: FAIL vì service chưa khai báo tools và chưa trả `sources`/`draft`.

- [ ] **Step 3: Mở rộng kiểu kết quả**

Trong `backend/src/types/ai.types.ts`:

```ts
export interface AiChatResult {
  reply: string;
  metadata: {
    provider: 'openai' | 'gemini';
    model: string;
    generatedAt: string;
  };
  sources: Array<{ id: number; name: string }>;
  draft: {
    itinerary: GeneratedItinerary;
    tripDraft: AiTripDraft;
    warnings: string[];
    budgetLevel: BudgetLevel | null;
  } | null;
  context: { tripCount: number; destinationCount: number };
}
```

- [ ] **Step 4: Thêm ràng buộc planning conversation**

Tích hợp `PLAN_INTENT_PATTERN`, `DATE_ONLY_FOLLOW_UP_PATTERN`, `DATE_TEXT_PATTERN`, `PLAN_DETAIL_PATTERN`, `activePlanningUserText`, `chatPlanDetails` và `userProvidedStartDate`. Ngày chỉ hợp lệ nếu có trong tin nhắn người dùng đang xử lý; không dùng ngày do model tự tạo.

- [ ] **Step 5: Khai báo tools chung**

Thêm `CHAT_TOOLS`, chuyển sang `GEMINI_CHAT_TOOLS`, và xác thực `prepare_itinerary` bằng:

```ts
const chatPlanArgumentsSchema = z.object({
  destinationCity: z.string().trim().min(1).max(100),
  days: z.number().int().min(1).max(MAX_DAYS),
  startDate: z.string().regex(DATE_PATTERN),
}).strict();
```

- [ ] **Step 6: Tích hợp vòng agent OpenAI**

Giữ `conversation` xuyên suốt request, gửi `tools: CHAT_TOOLS`, xử lý tối đa hai vòng, từ chối hơn ba tool call, replay bằng:

```ts
conversation.push({
  type: 'function_call_output',
  call_id: call.call_id,
  output: JSON.stringify(output),
});
```

Vòng cuối dùng `tool_choice: 'none'` nếu provider đã dùng hết giới hạn.

- [ ] **Step 7: Tích hợp vòng agent Gemini**

Dùng `config.chatModel || config.model`, `functionDeclarations`, `functionCallingConfig.mode` và replay bằng `functionResponse`. Với `gemini-3.5-flash`, thêm:

```ts
const geminiThinkingConfig = (model: string): JsonRecord =>
  model === 'gemini-3.5-flash'
    ? { thinkingConfig: { thinkingLevel: 'low' } }
    : {};
```

- [ ] **Step 8: Thực thi ba công cụ an toàn**

`search_destinations` gọi repository với query đã parse; `get_my_trips` chỉ dùng `userId` tham số service; `prepare_itinerary` gọi `generateItinerary` và lưu kết quả vào biến `draft`, không gọi repository lưu trip.

Kết quả chat phải là:

```ts
return {
  reply: agentResult.reply,
  sources: agentResult.sources,
  draft: agentResult.draft,
  metadata: {
    provider: config.provider,
    model: config.provider === 'gemini' ? (config.chatModel || config.model) : config.model,
    generatedAt: new Date().toISOString(),
  },
  context: {
    tripCount: trips.length,
    destinationCount: agentResult.sources.length,
  },
};
```

- [ ] **Step 9: Cập nhật smoke test**

Cập nhật mock `findDestinationsForChat` sang chữ ký `(query, limit)` và thêm `chatModel` vào config fake. Assertion phản hồi chat phải bao gồm `sources` và `draft`.

- [ ] **Step 10: Chạy test backend AI**

Run: `cd backend && npm run build && node --test tests/ai-agent.test.cjs tests/backend.smoke.test.cjs`

Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add backend/src/types/ai.types.ts backend/src/services/ai.service.ts backend/tests/ai-agent.test.cjs backend/tests/backend.smoke.test.cjs
git commit -m "feat(ai): add guarded chat agent tools"
```

---

### Task 4: Nguồn tham khảo và bản xem trước trên frontend

**Files:**
- Modify: `frontend/src/types/ai.types.ts`
- Create: `frontend/src/components/ai/AiDraftPreview.tsx`
- Modify: `frontend/src/pages/client/AiChatPage.tsx`
- Create: `frontend/tests/ai-draft-preview.test.mjs`

**Interfaces:**
- Consumes: `AiChatResult.sources` và `AiChatResult.draft` từ Task 3.
- Consumes: `aiService.saveTripDraft(draft: AiTripDraft): Promise<TripDetail>` hiện có.
- Produces: `AiDraftPreview({ draft, onSave, isSaving, savedTripId, error })`.

- [ ] **Step 1: Viết test đỏ cho preview**

Tích hợp `frontend/tests/ai-draft-preview.test.mjs`. Test đọc source component và xác nhận có ngày, địa điểm, callback lưu và không render proof:

```js
assert.match(source, /tripDraft\.startDate/);
assert.match(source, /activity\.destinationName/);
assert.match(source, /onClick=\{onSave\}/);
assert.doesNotMatch(source, /tripDraft\.proof/);
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

Run: `cd frontend && node --test --test-name-pattern="chat draft preview" tests/ai-draft-preview.test.mjs`

Expected: FAIL vì component chưa tồn tại.

- [ ] **Step 3: Mở rộng kiểu frontend**

```ts
export interface AiChatResult {
  reply: string;
  sources: Array<{ id: number; name: string }>;
  draft: {
    itinerary: GeneratedItinerary;
    tripDraft: AiTripDraft;
    warnings: string[];
    budgetLevel: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  } | null;
  metadata: {
    provider: 'openai' | 'gemini';
    model: string;
    generatedAt: string;
  };
  context: { tripCount: number; destinationCount: number };
}
```

- [ ] **Step 4: Tạo component preview thuần**

Component hiển thị title, summary, start date, số ngày, chi phí, số người, mức ngân sách, danh sách hoạt động, cảnh báo, lỗi lưu và một trong hai CTA:

```tsx
{savedTripId ? (
  <a href={`/trips/${savedTripId}`}>Xem chuyến đi đã lưu</a>
) : (
  <button type="button" onClick={onSave} disabled={isSaving}>
    {isSaving ? 'Đang lưu…' : 'Lưu chuyến đi'}
  </button>
)}
```

- [ ] **Step 5: Tích hợp preview và sources vào trang chat**

Mở rộng `ChatMessage`, lưu `sources`/`draft` theo tin nhắn, và thêm state:

```ts
const [savingDraftId, setSavingDraftId] = useState<string | null>(null);
const [savedTripIds, setSavedTripIds] = useState<Record<string, number>>({});
const [draftErrors, setDraftErrors] = useState<Record<string, string>>({});
```

`saveDraft` gọi `aiService.saveTripDraft`, ghi ID theo message, hiển thị lỗi theo message và luôn xóa `savingDraftId` trong `finally`. Render nguồn bằng `ROUTES.DESTINATION_DETAIL(source.id)`, tối đa tám item trước phần `<details>`.

- [ ] **Step 6: Chạy test và type-check**

Run: `cd frontend && node --test --test-name-pattern="chat draft preview" tests/ai-draft-preview.test.mjs`

Expected: PASS.

Run: `cd frontend && npm run type-check`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/types/ai.types.ts frontend/src/components/ai/AiDraftPreview.tsx frontend/src/pages/client/AiChatPage.tsx frontend/tests/ai-draft-preview.test.mjs
git commit -m "feat(ai): preview and save chat itinerary drafts"
```

---

### Task 5: Kiểm thử hồi quy và hoàn thiện

**Files:**
- Modify only if verification reveals an AI-integration defect: files listed in Tasks 1–4.

**Interfaces:**
- Consumes: all interfaces from Tasks 1–4.
- Produces: verified backend/frontend builds and complete passing test suites.

- [ ] **Step 1: Chạy toàn bộ backend suite**

Run: `cd backend && npm test`

Expected: TypeScript build thành công và mọi `tests/*.test.cjs` PASS.

- [ ] **Step 2: Chạy toàn bộ frontend suite**

Run: `cd frontend && npm test`

Expected: mọi `tests/*.test.mjs` PASS.

- [ ] **Step 3: Chạy lint và production build frontend**

Run: `cd frontend && npm run lint`

Expected: PASS với 0 warning.

Run: `cd frontend && npm run build`

Expected: TypeScript và Vite build PASS.

- [ ] **Step 4: Kiểm tra phạm vi và secret**

Run: `git status --short`

Expected: chỉ các file trong kế hoạch này thay đổi.

Run: `git diff --check`

Expected: không có lỗi whitespace.

Run: `git diff --name-only --cached | rg '(^|/)\.env$|node_modules|(^|/)dist/'`

Expected: không có output.

- [ ] **Step 5: Commit fix hồi quy nếu có**

Nếu Steps 1–4 yêu cầu sửa mã, chỉ stage các file AI liên quan và commit:

```bash
git add backend/.env.example backend/src/config/ai.ts backend/src/utils/ai-search.ts backend/src/repositories/ai.repository.ts backend/src/services/ai.service.ts backend/src/types/ai.types.ts backend/tests frontend/src/types/ai.types.ts frontend/src/components/ai/AiDraftPreview.tsx frontend/src/pages/client/AiChatPage.tsx frontend/tests/ai-draft-preview.test.mjs
git commit -m "fix(ai): resolve integration regressions"
```

Nếu không có thay đổi sau verification, không tạo commit rỗng.
