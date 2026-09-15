export interface TileState {
  source: 'osm' | 'osm-france';
  generation: number;
  status: 'loading' | 'ready' | 'error';
}

type TileAction =
  | { type: 'retry' }
  | { type: 'loading' | 'ready' | 'error' | 'timeout'; generation: number };

export const initialTileState: TileState = { source: 'osm', generation: 0, status: 'loading' };

export function getMapTileConfig(env: Record<string, string | undefined>) {
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const france = {
    url: 'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: `${attribution}, style by <a href="https://www.hotosm.org/">HOT</a>, hosted by <a href="https://www.openstreetmap.fr/fonds-de-carte/">OpenStreetMap France</a>`,
  };
  const osm = { url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', attribution };
  const readSource = (prefix: string, fallback: typeof osm) => {
    const url = env[`${prefix}_URL`]?.trim() || fallback.url;
    const parsed = new URL(url);
    if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password
      || !['{z}', '{x}', '{y}'].every(token => url.includes(token))) {
      throw new Error(`${prefix}_URL must be an HTTP(S) tile template with {z}, {x}, {y} and no embedded credentials`);
    }
    const customAttribution = env[`${prefix}_ATTRIBUTION`]?.trim();
    const knownSource = [france, osm].find(source => source.url === url);
    if (!customAttribution && !knownSource) {
      throw new Error(`${prefix}_ATTRIBUTION is required for a custom tile provider`);
    }
    return { url, attribution: customAttribution || knownSource!.attribution };
  };
  const timeoutMs = Number(env.VITE_MAP_TILE_TIMEOUT_MS?.trim() || 8000);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 60_000) {
    throw new Error('VITE_MAP_TILE_TIMEOUT_MS must be an integer between 1000 and 60000');
  }
  return {
    // Reducer source names are internal primary/fallback slots, independent of provider URLs.
    sources: {
      osm: readSource('VITE_MAP_TILE', france),
      'osm-france': readSource('VITE_MAP_FALLBACK_TILE', osm),
    },
    timeoutMs,
  };
}

export function tileStateReducer(state: TileState, action: TileAction): TileState {
  if (action.type === 'retry') {
    return { ...initialTileState, generation: state.generation + 1 };
  }
  // Removed layers can still emit events while the fallback mounts.
  if (action.generation !== state.generation) return state;
  if (action.type === 'error' || action.type === 'timeout') {
    return state.source === 'osm'
      ? { source: 'osm-france', generation: state.generation + 1, status: 'loading' }
      : { ...state, status: 'error' };
  }
  if (action.type === 'ready' && state.status === 'error') return state;
  return { ...state, status: action.type === 'ready' ? 'ready' : 'loading' };
}
