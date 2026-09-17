import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const frontendRoot = fileURLToPath(new URL('..', import.meta.url));

test('chat draft preview renders itinerary details and save CTA without proof token', async (t) => {
  const vite = await createServer({
    root: frontendRoot,
    configFile: false,
    resolve: { alias: { '@': path.join(frontendRoot, 'src') } },
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true },
    appType: 'custom',
  });
  t.after(() => vite.close());

  const { default: AiDraftPreview } = await vite.ssrLoadModule('/src/components/ai/AiDraftPreview.tsx');
  const markup = renderToStaticMarkup(React.createElement(AiDraftPreview, {
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
        aiRawData: '{}',
        aiProofToken: 'proof-token-must-never-appear',
      },
      warnings: ['Kiểm tra giá vé trước khi đi.'],
      budgetLevel: 'MEDIUM',
    },
    onSave: () => {},
    isSaving: false,
    savedTripId: undefined,
    error: undefined,
  }));

  assert.match(markup, /2026-10-14/);
  assert.match(markup, /Bãi biển Mỹ Khê/);
  assert.match(markup, /Lưu chuyến đi/);
  assert.doesNotMatch(markup, /proof-token-must-never-appear/);
});
