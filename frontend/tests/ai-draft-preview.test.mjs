import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const frontendRoot = fileURLToPath(new URL('..', import.meta.url));

const createViteServer = (t) => {
  const vite = createServer({
    root: frontendRoot,
    configFile: false,
    resolve: { alias: { '@': path.join(frontendRoot, 'src') } },
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true },
    appType: 'custom',
  });
  t.after(async () => (await vite).close());
  return vite;
};

const findElement = (element, type) => {
  if (!React.isValidElement(element)) return undefined;
  if (element.type === type) return element;
  return React.Children.toArray(element.props.children)
    .map((child) => findElement(child, type))
    .find(Boolean);
};

test('chat draft preview renders itinerary details and save CTA without proof token', async (t) => {
  const vite = await createViteServer(t);

  const { default: AiDraftPreview } = await vite.ssrLoadModule('/src/components/ai/AiDraftPreview.tsx');
  let saveCalls = 0;
  const props = {
    draft: {
      itinerary: {
        title: 'Ba ngày ở Đà Nẵng',
        destinationCity: 'Đà Nẵng',
        summary: 'Một lịch trình ven biển.',
        numberOfPeople: 2,
        totalEstimatedCost: 4200000,
        days: [{
          dayNumber: 1,
          date: '2026-10-14',
          theme: 'Biển và ẩm thực',
          note: '',
          estimatedCost: 1400000,
          activities: [{
            destinationId: 9,
            destinationName: 'Bãi biển Mỹ Khê',
            address: 'Đà Nẵng',
            latitude: 16.0544,
            longitude: 108.2479,
            sequenceOrder: 1,
            startTime: '08:00',
            endTime: '10:00',
            estimatedCost: 0,
            travelDistanceKm: null,
            travelDurationMinutes: null,
            travelMode: 'WALKING',
            note: 'Ngắm bình minh',
          }],
        }],
      },
      tripDraft: {
        name: 'Ba ngày ở Đà Nẵng',
        destinationCity: 'Đà Nẵng',
        startDate: '2026-10-14',
        endDate: '2026-10-16',
        budget: 4200000,
        numberOfPeople: 2,
        aiRawData: 'raw-data-must-never-appear',
        aiProofToken: 'proof-token-must-never-appear',
      },
      warnings: ['Kiểm tra giá vé trước khi đi.'],
      budgetLevel: 'MEDIUM',
    },
    onSave: () => { saveCalls += 1; },
    isSaving: false,
    savedTripId: undefined,
    error: undefined,
  };
  const markup = renderToStaticMarkup(React.createElement(AiDraftPreview, props));

  assert.match(markup, /2026-10-14/);
  assert.match(markup, /Bãi biển Mỹ Khê/);
  assert.match(markup, /Lưu chuyến đi/);
  assert.doesNotMatch(markup, /proof-token-must-never-appear/);
  assert.doesNotMatch(markup, /raw-data-must-never-appear/);

  const preview = AiDraftPreview(props);
  const saveButton = findElement(preview, 'button');
  assert.equal(typeof saveButton?.props.onClick, 'function');
  saveButton.props.onClick();
  assert.equal(saveCalls, 1);
});

test('draft save guard keeps a newer save active after reset invalidates an older request', async (t) => {
  const vite = await createViteServer(t);
  const { createDraftSaveGuard } = await vite.ssrLoadModule('/src/utils/ai-draft-save-guard.ts');
  const guard = createDraftSaveGuard();

  const staleRequest = guard.begin();
  assert.ok(staleRequest);
  guard.reset();

  const freshRequest = guard.begin();
  assert.ok(freshRequest);
  assert.equal(guard.isCurrent(staleRequest), false);
  assert.equal(guard.complete(staleRequest), false);
  assert.equal(guard.isCurrent(freshRequest), true);
  assert.equal(guard.complete(freshRequest), true);
});
