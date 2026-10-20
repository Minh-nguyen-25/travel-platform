import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const load = (filename) => {
  const exports = {};
  const source = readFileSync(new URL(filename, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  new Function('exports', compiled)(exports);
  return exports;
};
const { resolveScenicThemes, selectScenicPhotos, scenicInputFromDestinations, isScenicImageUrl } = load('../src/utils/scenic-scene.ts');
const { SCENIC_PHOTOS } = load('../src/data/scenic-photos.ts');

test('category scenes use API category names instead of assuming stable numeric IDs', () => {
  assert.deepEqual(resolveScenicThemes('/destinations', '?categoryId=987', ['Ẩm thực']), ['food']);
  assert.deepEqual(resolveScenicThemes('/destinations', '?categoryId=1', ['ĐẢO']), ['coast']);
  assert.deepEqual(resolveScenicThemes('/destinations', '?categoryIds=7,900', ['Biển & Đảo', 'Núi & Rừng']), ['coast', 'nature']);
  assert.deepEqual(resolveScenicThemes('/destinations', '', ['Di tích lịch sử']), ['heritage']);
  assert.deepEqual(resolveScenicThemes('/destinations', '', ['Giải trí & Mua sắm']), ['city']);
});

test('search and trip routes select relevant scenes without loading extra catalog data', () => {
  assert.deepEqual(resolveScenicThemes('/destinations', '?search=Hội+An'), ['heritage']);
  assert.deepEqual(resolveScenicThemes('/destinations', '?search=Phú+Quốc'), ['coast']);
  assert.equal(resolveScenicThemes('/trips/12', '', ['Ẩm thực'])[0], 'journey');
  assert.equal(resolveScenicThemes('/shared-trip/token', '')[0], 'journey');
});

test('multi-category scenes interleave themes and never duplicate API/local variants', () => {
  const input = { photos: [{ src: '/images/destinations/my-khe.jpg', caption: 'Ảnh từ API' }] };
  const selected = selectScenicPhotos(SCENIC_PHOTOS, ['coast', 'food'], input);
  assert.equal(selected[0].src, '/images/scenic/my-khe.webp');
  assert(selected.slice(0, 5).some((photo) => photo.themes.includes('food')));
  assert(selected.slice(0, 5).some((photo) => photo.themes.includes('coast')));
  const sources = selected.map((photo) => photo.originalSrc ?? photo.src);
  assert.equal(new Set(sources).size, sources.length);
});

test('detail and favorite photos use existing response fields and ignore unusable URLs', () => {
  const input = scenicInputFromDestinations([
    { name: 'Địa điểm thật', categories: [{ name: 'Núi & Rừng' }], images: [{ imageUrl: 'javascript:bad', isPrimary: true }, { imageUrl: 'https://images.example.test/place.jpg', isPrimary: false }] },
  ]);
  assert.deepEqual(input.categoryNames, ['Núi & Rừng']);
  assert.deepEqual(input.photos, [{ src: 'https://images.example.test/place.jpg', caption: 'Địa điểm thật' }]);
  assert.equal(isScenicImageUrl('https://user:password@example.test/a.jpg'), false);
  assert.equal(isScenicImageUrl('//unknown.test/a.jpg'), false);
  assert.equal(isScenicImageUrl('/images/destinations/my-khe.jpg'), true);
});

test('all local scenery has a small optimized asset and a documented image license', () => {
  const credits = JSON.parse(readFileSync(new URL('../public/images/scenic/credits.json', import.meta.url), 'utf8'));
  for (const photo of SCENIC_PHOTOS) {
    const bytes = readFileSync(new URL(`../public${photo.src}`, import.meta.url));
    assert(bytes.length < 80_000, `${photo.src} is too large for a decorative thumbnail`);
    assert(photo.width <= 480 && photo.height <= 640);
    const credit = credits.find((entry) => photo.src.endsWith(`/${entry.filename}`));
    assert(credit?.author && credit?.sourceUrl && credit?.license, `${photo.src} has incomplete credits`);
  }
});
