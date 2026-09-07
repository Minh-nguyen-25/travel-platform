import { useEffect, useState } from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TripIcon, { type IconName } from '@/components/trip/TripIcon';
import type { Itinerary, TravelMode, TripDay } from '@/types/trip.types';
import { formatCurrency, formatTime } from '@/utils/trip.utils';

interface TripTimelineProps {
  day: TripDay;
  isMutating?: boolean;
  onAdd: () => void;
  onDelete: (itinerary: Itinerary) => void | Promise<void>;
  onReorder: (itineraryIds: number[]) => Promise<void>;
  onReorderError: (message: string) => void;
}

const travelMode: Record<TravelMode, { label: string; icon: IconName }> = {
  WALKING: { label: 'Đi bộ', icon: 'walk' },
  DRIVING: { label: 'Ô tô', icon: 'car' },
  TRANSIT: { label: 'Phương tiện công cộng', icon: 'bus' },
  CYCLING: { label: 'Xe đạp', icon: 'bike' },
};

const primaryImage = (itinerary: Itinerary): string | null =>
  itinerary.destination.images.find((image) => image.isPrimary)?.imageUrl ??
  itinerary.destination.images[0]?.imageUrl ??
  null;

function TravelConnector({ itinerary }: { itinerary: Itinerary }) {
  if (
    !itinerary.travelMode &&
    itinerary.travelDurationMinutes === null &&
    itinerary.travelDistanceKm === null
  ) {
    return <div className="ml-[75px] h-5 border-l-2 border-dashed border-primary-100 sm:ml-[91px]" />;
  }

  const mode = itinerary.travelMode ? travelMode[itinerary.travelMode] : null;
  return (
    <div className="relative ml-[75px] flex min-h-12 items-center border-l-2 border-dashed border-primary-200 pl-5 sm:ml-[91px]">
      <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full border border-primary-100 bg-primary-50 text-primary-600">
        <TripIcon name={mode?.icon ?? 'route'} size={13} />
      </span>
      <div className="flex flex-wrap items-center gap-x-2 text-xs font-medium text-gray-500">
        {mode && <span>{mode.label}</span>}
        {itinerary.travelDurationMinutes !== null && (
          <>
            {mode && <span className="text-gray-300">•</span>}
            <span>{itinerary.travelDurationMinutes} phút</span>
          </>
        )}
        {itinerary.travelDistanceKm !== null && (
          <>
            <span className="text-gray-300">•</span>
            <span>{Number(itinerary.travelDistanceKm).toLocaleString('vi-VN')} km</span>
          </>
        )}
      </div>
    </div>
  );
}

interface SortableTimelineItemProps {
  itinerary: Itinerary;
  index: number;
  onDelete: (itinerary: Itinerary) => void | Promise<void>;
}

function SortableTimelineItem({ itinerary, index, onDelete }: SortableTimelineItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: itinerary.id,
  });
  const imageUrl = primaryImage(itinerary);
  const categories = itinerary.destination.categories.slice(0, 2);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative grid grid-cols-[58px_minmax(0,1fr)] gap-4 sm:grid-cols-[74px_minmax(0,1fr)] ${
        isDragging ? 'z-30 opacity-80' : ''
      }`}
    >
      <div className="pt-5 text-right">
        <p className="text-sm font-extrabold text-gray-900">{formatTime(itinerary.startTime) || '--:--'}</p>
        {itinerary.endTime && (
          <p className="mt-1 text-[11px] font-medium text-gray-400">{formatTime(itinerary.endTime)}</p>
        )}
      </div>

      <div className="relative">
        <span className="absolute -left-[25px] top-6 z-10 flex h-5 w-5 items-center justify-center rounded-full border-[5px] border-white bg-primary-600 shadow ring-2 ring-primary-100">
          <span className="sr-only">Điểm {index + 1}</span>
        </span>
        <article
          className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
            isDragging
              ? 'scale-[1.01] border-primary-300 shadow-xl ring-4 ring-primary-100'
              : 'border-gray-100 shadow-sm hover:-translate-y-0.5 hover:border-primary-100 hover:shadow-lg'
          }`}
        >
          <div className="flex flex-col sm:flex-row">
            <div className="relative h-36 shrink-0 overflow-hidden bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100 sm:h-auto sm:w-44">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={itinerary.destination.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-primary-500 shadow-sm backdrop-blur-sm">
                    <TripIcon name="map-pin" size={23} />
                  </div>
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-extrabold text-gray-800 shadow-sm backdrop-blur-sm">
                #{index + 1}
              </span>
            </div>

            <div className="min-w-0 flex-1 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-extrabold text-gray-900 sm:text-lg">
                      {itinerary.destination.name}
                    </h3>
                    {Number(itinerary.destination.rating) > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-1 text-[11px] font-bold text-accent-600">
                        <TripIcon name="star" size={12} className="text-warning" />
                        {Number(itinerary.destination.rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex items-start gap-1.5 text-xs leading-5 text-gray-500">
                    <TripIcon name="map-pin" size={14} className="mt-0.5 flex-none text-gray-400" />
                    <span className="line-clamp-1">{itinerary.destination.address}</span>
                  </p>
                </div>

                <div className="flex flex-none items-center gap-1">
                  <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="cursor-grab touch-none rounded-lg p-2 text-gray-400 transition hover:bg-primary-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300 active:cursor-grabbing"
                    aria-label={`Kéo để sắp xếp ${itinerary.destination.name}`}
                    title="Kéo để sắp xếp"
                  >
                    <TripIcon name="grip" size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDelete(itinerary)}
                    className="rounded-lg p-2 text-gray-400 opacity-100 transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label={`Xóa ${itinerary.destination.name}`}
                    title="Xóa khỏi lịch trình"
                  >
                    <TripIcon name="trash" size={17} />
                  </button>
                </div>
              </div>

              {categories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {categories.map((category) => (
                    <span
                      key={category.id}
                      className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-bold uppercase tracking-normal text-gray-500"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-100 pt-3 text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-gray-600">
                  <TripIcon name="clock" size={14} className="text-primary-500" />
                  {itinerary.destination.visitDuration
                    ? `${itinerary.destination.visitDuration} phút`
                    : 'Linh hoạt'}
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-gray-600">
                  <TripIcon name="wallet" size={14} className="text-accent-500" />
                  {Number(itinerary.estimatedCost) > 0
                    ? formatCurrency(itinerary.estimatedCost)
                    : 'Chưa có chi phí'}
                </span>
              </div>

              {itinerary.note && (
                <p className="mt-3 rounded-lg bg-primary-50 px-3 py-2 text-xs leading-5 text-primary-800">
                  {itinerary.note}
                </p>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export default function TripTimeline({
  day,
  isMutating = false,
  onAdd,
  onDelete,
  onReorder,
  onReorderError,
}: TripTimelineProps) {
  const [items, setItems] = useState(day.itineraries);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    setItems(day.itineraries);
  }, [day.id, day.itineraries]);

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || isSavingOrder) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const previousItems = items;
    const nextItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
      ...item,
      sequenceOrder: index + 1,
    }));
    setItems(nextItems);
    setIsSavingOrder(true);

    try {
      await onReorder(nextItems.map((item) => item.id));
    } catch {
      setItems(previousItems);
      onReorderError('Không thể lưu thứ tự mới. Lịch trình đã được khôi phục.');
    } finally {
      setIsSavingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-primary-200 bg-white px-6 py-14 text-center shadow-sm">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-50" />
        <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-accent-50" />
        <div className="relative">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-200">
            <TripIcon name="route" size={29} />
          </div>
          <h3 className="mt-5 text-xl font-extrabold text-gray-900">Ngày mới, hành trình mới</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            Thêm điểm đến đầu tiên để biến ngày này thành một timeline trực quan.
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-bold text-white shadow-lg shadow-primary-200 transition hover:-translate-y-0.5 hover:bg-primary-700"
          >
            <TripIcon name="plus" size={17} />
            Thêm địa điểm đầu tiên
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={isMutating ? 'pointer-events-none opacity-70' : ''}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-gray-500">
          <span className="hidden sm:inline">Giữ biểu tượng </span>
          <TripIcon name="grip" size={14} className="mx-1 inline text-gray-400" />
          và kéo để đổi thứ tự
        </p>
        {isSavingOrder && (
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary-600">
            <TripIcon name="loader" size={14} className="animate-spin" />
            Đang lưu...
          </span>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => void handleDragEnd(event)}>
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div>
            {items.map((itinerary, index) => (
              <div key={itinerary.id}>
                {index > 0 && <TravelConnector itinerary={itinerary} />}
                <SortableTimelineItem itinerary={itinerary} index={index} onDelete={onDelete} />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="ml-[75px] border-l-2 border-dashed border-primary-100 pb-1 pl-5 pt-5 sm:ml-[91px]">
        <button
          type="button"
          onClick={onAdd}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary-200 bg-primary-50/60 px-5 py-4 text-sm font-bold text-primary-700 transition hover:border-primary-400 hover:bg-primary-50 sm:w-auto"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-primary-600 shadow-sm transition group-hover:rotate-90">
            <TripIcon name="plus" size={16} />
          </span>
          Thêm điểm dừng
        </button>
      </div>
    </div>
  );
}
