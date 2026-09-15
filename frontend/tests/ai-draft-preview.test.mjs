import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const vite = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true, entries: [] },
  server: { middlewareMode: true },
  appType: 'custom',
});
after(async () => vite.close());

test('chat draft preview shows places and date for review without exposing proof data', async () => {
  const { default: AiDraftPreview } = await vite.ssrLoadModule('/src/components/ai/AiDraftPreview.tsx');
  const draft = {
    itinerary: {
      title: 'Một ngày Đà Nẵng', destinationCity: 'Đà Nẵng', summary: 'Đi biển',
      numberOfPeople: 4, totalEstimatedCost: 0,
      days: [{ dayNumber: 1, date: '2026-09-20', theme: 'Biển', note: '', estimatedCost: 0,
        activities: [{ destinationId: 17, destinationName: 'Biển Mỹ Khê', address: 'Đà Nẵng',
          latitude: 16, longitude: 108, sequenceOrder: 1, startTime: '09:00', endTime: '10:30',
          estimatedCost: 0, travelDistanceKm: null, travelDurationMinutes: null,
          travelMode: 'WALKING', note: 'Tắm biển' }],
      }],
    },
    tripDraft: { startDate: '2026-09-20', numberOfPeople: 4,
      aiProofToken: 'private-proof-token', aiRawData: 'private-raw-data' },
    budgetLevel: 'LOW',
    warnings: [],
  };
  const html = renderToStaticMarkup(React.createElement(AiDraftPreview, {
    draft, onSave: () => {}, isSaving: false, savedTripId: null, error: '',
  }));

  assert.match(html, /Một ngày Đà Nẵng/);
  assert.match(html, /Biển Mỹ Khê/);
  assert.match(html, /href="\/destinations\/17"/);
  assert.match(html, /2026-09-20/);
  assert.match(html, /4 người/);
  assert.match(html, /Mức chi tiêu tiết kiệm/);
  assert.match(html, /Bắt đầu 2026-09-20/);
  assert.match(html, /Lưu chuyến đi/);
  assert.equal(html.includes('private-proof-token'), false);
  assert.equal(html.includes('private-raw-data'), false);
});
