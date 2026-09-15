import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { planVerifiedCoordinates } from '../src/utils/verified-map-data';

// Deliberately curated landmark identities, not fuzzy geocoding or generated coordinates.
const landmarks: Record<string, string> = {
  'Q1151254': 'Hồ Hoàn Kiếm',
  'Q1202019': 'Văn Miếu - Quốc Tử Giám',
  'Q206219': 'Hoàng thành Thăng Long',
  'Q1048345': 'Bảo tàng Dân tộc học Việt Nam',
  'Q5305270': 'Cầu Rồng Đà Nẵng',
  'Q933384': 'Dinh Độc Lập',
  'Q703871': 'Bảo tàng Chứng tích Chiến tranh',
  'Q3232879': 'Chợ Bến Thành',
  'Q11300021': 'Phố đi bộ Nguyễn Huệ',
  'Q2227270': 'Bưu điện Trung tâm Sài Gòn',
};

async function main() {
  const url = new URL('https://www.wikidata.org/w/api.php');
  url.search = new URLSearchParams({ action: 'wbgetentities', ids: Object.keys(landmarks).join('|'),
    props: 'claims|info', format: 'json' }).toString();
  const response = await fetch(url, {
    headers: { 'User-Agent': 'TravelPlatform/1.0 (curated landmark coordinate refresh)' },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Wikidata HTTP ${response.status}`);
  const payload = await response.json() as { entities: Record<string, {
    lastrevid: number;
    claims?: { P625?: Array<{ rank: string; mainsnak: { datavalue?: { value: {
      latitude: number; longitude: number; precision: number; globe: string;
    } } } }> };
  }> };
  const destinations = Object.entries(landmarks).flatMap(([id, name]) => {
    const entity = payload.entities?.[id];
    const claims = (entity?.claims?.P625 || []).filter(claim => claim.rank !== 'deprecated');
    const preferred = claims.filter(claim => claim.rank === 'preferred');
    const coordinates = (preferred.length ? preferred : claims)
      .map(claim => claim.mainsnak.datavalue?.value)
      .filter(value => value && value.globe === 'http://www.wikidata.org/entity/Q2'
        && value.precision > 0 && value.precision <= 0.001)
      .sort((a, b) => a!.precision - b!.precision);
    const coordinate = coordinates[0];
    if (!coordinate || !Number.isInteger(entity?.lastrevid)) {
      console.log(`Skipped: ${name} (no sufficiently precise Earth coordinate)`);
      return [];
    }
    return [{ name, latitude: Number(coordinate.latitude.toFixed(7)), longitude: Number(coordinate.longitude.toFixed(7)),
      sourceUrl: `https://www.wikidata.org/w/index.php?title=${id}&oldid=${entity.lastrevid}` }];
  });
  if (!destinations.length) throw new Error('No valid coordinates received; retaining the existing snapshot');
  const document = { fetchedAt: new Date().toISOString(), destinations };
  planVerifiedCoordinates(document, []);
  const output = resolve(process.cwd(), 'data/verified-destinations.json');
  await mkdir(resolve(process.cwd(), 'data'), { recursive: true });
  await writeFile(output, JSON.stringify(document, null, 2) + '\n', 'utf8');
  console.log(`Saved ${destinations.length} source-backed coordinates to ${output}. Database unchanged.`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
