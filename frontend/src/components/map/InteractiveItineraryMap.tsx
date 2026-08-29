import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { latLngBounds } from 'leaflet';
import type { CircleMarker as LeafletCircleMarker, LatLngTuple } from 'leaflet';
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Popup,
  ScaleControl,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';
import { useItineraryRoute } from '@/hooks/useItineraryRoute';
import type {
  ItineraryMapStop,
  ItineraryTravelMode,
  MapCoordinate,
  RoutingProfile,
} from '@/types/map.types';
import 'leaflet/dist/leaflet.css';
import './InteractiveItineraryMap.css';

const DEFAULT_CENTER: LatLngTuple = [16.0471, 108.2068];
const DEFAULT_ZOOM = 5;
const DEFAULT_HEIGHT = '28rem';
const OPEN_STREET_MAP_TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const OPEN_STREET_MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

interface NormalizedStop {
  latitude: number;
  longitude: number;
  source: ItineraryMapStop;
}

type TileStatus = 'loading' | 'ready' | 'error';

export interface InteractiveItineraryMapProps {
  ariaLabel?: string;
  className?: string;
  height?: number | string;
  maxFitZoom?: number;
  onStopSelect?: (stop: ItineraryMapStop) => void;
  profile?: RoutingProfile;
  routeColor?: string;
  routeEnabled?: boolean;
  scrollWheelZoom?: boolean;
  showSummary?: boolean;
  stops: ItineraryMapStop[];
  title?: string;
  travelMode?: ItineraryTravelMode | null;
}

const parseCoordinate = (value: number | string, minimum: number, maximum: number): number | null => {
  if (typeof value === 'string' && value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum ? parsed : null;
};

const normalizeStops = (stops: ItineraryMapStop[]): NormalizedStop[] => stops.flatMap((stop) => {
  const latitude = parseCoordinate(stop.latitude, -90, 90);
  const longitude = parseCoordinate(stop.longitude, -180, 180);
  return latitude === null || longitude === null ? [] : [{ latitude, longitude, source: stop }];
});

const getStopName = (stop: ItineraryMapStop): string =>
  stop.name?.trim() || stop.destinationName?.trim() || 'Điểm dừng';

const getStopId = (stop: ItineraryMapStop): string | number =>
  stop.id ?? stop.destinationId ?? 'stop';

const resolveRoutingProfile = (
  profile: RoutingProfile | undefined,
  travelMode: ItineraryTravelMode | null | undefined,
): RoutingProfile => {
  if (profile) return profile;
  if (travelMode === 'WALKING') return 'walking';
  if (travelMode === 'CYCLING') return 'cycling';
  // OSRM has no transit profile; TRANSIT intentionally uses driving as its approximation.
  return 'driving';
};

const formatDuration = (minutes: number): string => {
  const roundedMinutes = Math.max(0, Math.round(minutes));
  if (roundedMinutes < 60) return `${roundedMinutes} phút`;
  const hours = Math.floor(roundedMinutes / 60);
  const remainder = roundedMinutes % 60;
  return remainder ? `${hours} giờ ${remainder} phút` : `${hours} giờ`;
};

const profileLabels: Record<RoutingProfile, string> = {
  cycling: 'Xe đạp',
  driving: 'Ô tô',
  walking: 'Đi bộ',
};

interface MapViewportControllerProps {
  ariaLabel: string;
  maxFitZoom: number;
  pointsKey: string;
  scrollWheelZoom: boolean;
}

function MapViewportController({
  ariaLabel,
  maxFitZoom,
  pointsKey,
  scrollWheelZoom,
}: MapViewportControllerProps) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', `${ariaLabel}. Dùng phím cộng và trừ để thu phóng bản đồ.`);
    container.setAttribute('tabindex', '0');

    return () => {
      container.removeAttribute('role');
      container.removeAttribute('aria-label');
      container.removeAttribute('tabindex');
    };
  }, [ariaLabel, map]);

  useEffect(() => {
    if (scrollWheelZoom) map.scrollWheelZoom.enable();
    else map.scrollWheelZoom.disable();
  }, [map, scrollWheelZoom]);

  useEffect(() => {
    const points = JSON.parse(pointsKey) as LatLngTuple[];
    if (points.length > 1) {
      const bounds = latLngBounds(points);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { animate: false, maxZoom: maxFitZoom, padding: [32, 32] });
      }
    } else if (points.length === 1) {
      map.setView(points[0], maxFitZoom, { animate: false });
    } else {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: false });
    }
  }, [map, maxFitZoom, pointsKey]);

  useEffect(() => {
    const resizeMap = () => map.invalidateSize({ animate: false });
    const frameId = window.requestAnimationFrame(resizeMap);
    const container = map.getContainer();
    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(resizeMap);
    resizeObserver?.observe(container);
    if (!resizeObserver) window.addEventListener('resize', resizeMap);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener('resize', resizeMap);
    };
  }, [map]);

  return null;
}

interface AccessibleStopMarkerProps {
  index: number;
  onSelect?: (stop: ItineraryMapStop) => void;
  position: LatLngTuple;
  routeColor: string;
  stop: ItineraryMapStop;
}

function AccessibleStopMarker({
  index,
  onSelect,
  position,
  routeColor,
  stop,
}: AccessibleStopMarkerProps) {
  const markerRef = useRef<LeafletCircleMarker | null>(null);
  const stopName = getStopName(stop);
  const accessibleName = `Điểm ${index}: ${stopName}`;

  useEffect(() => {
    const marker = markerRef.current;
    const element = marker?.getElement();
    if (!marker || !element) return undefined;

    const handleKeyDown: EventListener = (event) => {
      if (!(event instanceof KeyboardEvent)) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      marker.fire('click');
      marker.openPopup();
    };

    element.setAttribute('tabindex', '0');
    element.setAttribute('role', 'button');
    element.setAttribute('aria-label', accessibleName);
    element.addEventListener('keydown', handleKeyDown);

    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [accessibleName]);

  return (
    <CircleMarker
      ref={markerRef}
      center={position}
      radius={18}
      pathOptions={{
        color: '#ffffff',
        fillColor: routeColor,
        fillOpacity: 1,
        opacity: 1,
        weight: 3,
      }}
      eventHandlers={{ click: () => onSelect?.(stop) }}
    >
      <Tooltip permanent direction="center" className="itinerary-map__marker-label" opacity={1}>
        {index}
      </Tooltip>
      <Popup maxWidth={280}>
        <div className="itinerary-map__popup">
          <strong>{index}. {stopName}</strong>
          {stop.address?.trim() && <p>{stop.address}</p>}
        </div>
      </Popup>
    </CircleMarker>
  );
}

export default function InteractiveItineraryMap({
  ariaLabel = 'Bản đồ tương tác của lịch trình',
  className = '',
  height = DEFAULT_HEIGHT,
  maxFitZoom = 15,
  onStopSelect,
  profile,
  routeColor = '#2563eb',
  routeEnabled = true,
  scrollWheelZoom = false,
  showSummary = true,
  stops,
  title = 'Bản đồ hành trình',
  travelMode,
}: InteractiveItineraryMapProps) {
  const [tileAttempt, setTileAttempt] = useState(0);
  const [tileStatus, setTileStatus] = useState<TileStatus>('loading');
  const normalizedStops = useMemo(() => normalizeStops(stops), [stops]);
  const coordinates = useMemo<MapCoordinate[]>(
    () => normalizedStops.map(({ latitude, longitude }) => ({ latitude, longitude })),
    [normalizedStops],
  );
  const invalidStopCount = stops.length - normalizedStops.length;
  const routingProfile = resolveRoutingProfile(profile, travelMode);
  const {
    error: routeError,
    retry: retryRoute,
    route,
    status: routeStatus,
  } = useItineraryRoute({ coordinates, enabled: routeEnabled, profile: routingProfile });

  const fitPoints = useMemo<LatLngTuple[]>(() => {
    const points: LatLngTuple[] = normalizedStops.map(
      ({ latitude, longitude }) => [latitude, longitude],
    );
    route?.geometry.coordinates.forEach(([longitude, latitude]) => {
      if (
        Number.isFinite(latitude)
        && Number.isFinite(longitude)
        && latitude >= -90
        && latitude <= 90
        && longitude >= -180
        && longitude <= 180
      ) {
        points.push([latitude, longitude]);
      }
    });
    return points;
  }, [normalizedStops, route]);
  const pointsKey = JSON.stringify(fitPoints);
  const routeKey = route ? JSON.stringify(route.geometry.coordinates) : 'no-route';
  const mapHeight = typeof height === 'number' ? `${height}px` : height;
  const rootStyle = { '--itinerary-map-height': mapHeight } as CSSProperties;
  const rootClassName = ['itinerary-map', className].filter(Boolean).join(' ');
  const routeSummary = route
    ? `${route.distanceKm.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} km · ${formatDuration(route.durationMinutes)}`
    : null;
  const isLoading = tileStatus === 'loading' || routeStatus === 'loading';

  const retryTiles = () => {
    setTileStatus('loading');
    setTileAttempt((value) => value + 1);
  };

  return (
    <section className={rootClassName} style={rootStyle} aria-label={ariaLabel}>
      <div className="itinerary-map__header">
        <div>
          <h2 className="itinerary-map__title">{title}</h2>
          <p className="itinerary-map__subtitle">
            {normalizedStops.length > 0
              ? `${normalizedStops.length} điểm dừng · ${profileLabels[routingProfile]}`
              : 'Chưa có điểm dừng hợp lệ'}
          </p>
        </div>
        {showSummary && routeSummary && (
          <p className="itinerary-map__summary" aria-label={`Tổng tuyến đường: ${routeSummary}`}>
            {routeSummary}
          </p>
        )}
      </div>

      <div className="itinerary-map__viewport">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          className="itinerary-map__canvas"
          attributionControl
          keyboard
          scrollWheelZoom={scrollWheelZoom}
          zoomControl
        >
          <TileLayer
            key={tileAttempt}
            attribution={OPEN_STREET_MAP_ATTRIBUTION}
            url={OPEN_STREET_MAP_TILES}
            maxZoom={19}
            minZoom={2}
            eventHandlers={{
              load: () => setTileStatus((current) => current === 'error' ? current : 'ready'),
              loading: () => setTileStatus('loading'),
              tileerror: () => setTileStatus('error'),
            }}
          />
          <ScaleControl imperial={false} metric position="bottomleft" />
          {route && (
            <GeoJSON
              key={routeKey}
              data={route.geometry}
              interactive={false}
              style={{
                color: routeColor,
                lineCap: 'round',
                lineJoin: 'round',
                opacity: 0.9,
                weight: 5,
              }}
            />
          )}
          {normalizedStops.map((stop, index) => (
            <AccessibleStopMarker
              key={`${getStopId(stop.source)}-${index}`}
              index={index + 1}
              onSelect={onStopSelect}
              position={[stop.latitude, stop.longitude]}
              routeColor={routeColor}
              stop={stop.source}
            />
          ))}
          <MapViewportController
            ariaLabel={ariaLabel}
            maxFitZoom={maxFitZoom}
            pointsKey={pointsKey}
            scrollWheelZoom={scrollWheelZoom}
          />
        </MapContainer>

        {isLoading && (
          <div className="itinerary-map__loading" role="status" aria-live="polite">
            <span className="itinerary-map__spinner" aria-hidden="true" />
            {routeStatus === 'loading' ? 'Đang tính tuyến đường…' : 'Đang tải bản đồ…'}
          </div>
        )}

        {tileStatus !== 'loading' && normalizedStops.length === 0 && (
          <div className="itinerary-map__empty" role="status">
            Chưa có tọa độ hợp lệ để hiển thị.
          </div>
        )}
      </div>

      {(routeError || tileStatus === 'error' || invalidStopCount > 0) && (
        <div className="itinerary-map__notices" aria-live="polite">
          {routeError && (
            <div className="itinerary-map__notice itinerary-map__notice--error" role="alert">
              <span>{routeError} Các điểm dừng vẫn được hiển thị trên bản đồ.</span>
              {normalizedStops.length <= 100 && (
                <button type="button" onClick={retryRoute}>Thử lại tuyến đường</button>
              )}
            </div>
          )}
          {tileStatus === 'error' && (
            <div className="itinerary-map__notice itinerary-map__notice--error" role="alert">
              <span>Không thể tải một số ô bản đồ OpenStreetMap.</span>
              <button type="button" onClick={retryTiles}>Tải lại bản đồ nền</button>
            </div>
          )}
          {invalidStopCount > 0 && (
            <p className="itinerary-map__notice">
              {invalidStopCount} điểm dừng thiếu tọa độ hợp lệ đã được bỏ qua.
            </p>
          )}
        </div>
      )}

      <ol className="sr-only">
        {normalizedStops.map(({ source }, index) => (
          <li key={`${getStopId(source)}-${index}`}>
            Điểm {index + 1}: {getStopName(source)}{source.address ? `, ${source.address}` : ''}
          </li>
        ))}
      </ol>
    </section>
  );
}
