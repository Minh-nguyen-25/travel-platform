import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Modal from '@/components/common/Modal';
import TripIcon from '@/components/trip/TripIcon';
import { tripService } from '@/services/trip.service';
import type { Destination, TripDay } from '@/types/trip.types';
import { formatCurrency, getApiErrorMessage } from '@/utils/trip.utils';

interface AddPlaceModalProps {
  isOpen: boolean;
  tripId: number;
  day: TripDay | null;
  onClose: () => void;
  onAdded: () => void | Promise<void>;
}

const getPrimaryImage = (destination: Destination): string | null =>
  destination.images.find((image) => image.isPrimary)?.imageUrl ??
  destination.images[0]?.imageUrl ??
  null;

export default function AddPlaceModal({
  isOpen,
  tripId,
  day,
  onClose,
  onAdded,
}: AddPlaceModalProps) {
  const [query, setQuery] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [note, setNote] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setIsSearching(true);
      setSearchError('');

      void tripService
        .searchDestinations({ page: 1, limit: 24, search: query.trim() || undefined })
        .then((result) => {
          if (!cancelled) setDestinations(result.data);
        })
        .catch((error: unknown) => {
          if (!cancelled) {
            setDestinations([]);
            setSearchError(
              getApiErrorMessage(
                error,
                'Chưa thể tải danh sách địa điểm. Vui lòng thử lại sau.',
              ),
            );
          }
        })
        .finally(() => {
          if (!cancelled) setIsSearching(false);
        });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isOpen, query]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setDestinations([]);
      setSelectedDestination(null);
      setActiveCategory('Tất cả');
      setStartTime('');
      setEndTime('');
      setEstimatedCost('');
      setNote('');
      setSearchError('');
      setFormError('');
    }
  }, [isOpen]);

  const categories = useMemo(() => {
    const names = destinations.flatMap((destination) =>
      destination.categories.map((category) => category.name),
    );
    return ['Tất cả', ...Array.from(new Set(names)).slice(0, 5)];
  }, [destinations]);

  const visibleDestinations = useMemo(
    () =>
      activeCategory === 'Tất cả'
        ? destinations
        : destinations.filter((destination) =>
            destination.categories.some((category) => category.name === activeCategory),
          ),
    [activeCategory, destinations],
  );

  const chooseDestination = (destination: Destination) => {
    setSelectedDestination(destination);
    setFormError('');
    if (!estimatedCost && Number(destination.ticketPrice) > 0) {
      setEstimatedCost(String(Number(destination.ticketPrice)));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!day || !selectedDestination) return;

    if (startTime && endTime && endTime <= startTime) {
      setFormError('Giờ kết thúc phải sau giờ bắt đầu.');
      return;
    }

    const parsedCost = estimatedCost === '' ? 0 : Number(estimatedCost);
    if (!Number.isFinite(parsedCost) || parsedCost < 0) {
      setFormError('Chi phí dự kiến không hợp lệ.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      await tripService.createItinerary(tripId, day.id, {
        destinationId: selectedDestination.id,
        startTime: startTime || null,
        endTime: endTime || null,
        estimatedCost: parsedCost,
        note: note.trim() || null,
      });
      await onAdded();
      onClose();
    } catch (error: unknown) {
      setFormError(getApiErrorMessage(error, 'Không thể thêm địa điểm vào lịch trình.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={day ? `Thêm địa điểm · Ngày ${day.dayNumber}` : 'Thêm địa điểm'}
      size="2xl"
    >
      <form onSubmit={(event) => void handleSubmit(event)}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
          <section className="min-w-0">
            <div className="relative">
              <TripIcon
                name="search"
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm bảo tàng, quán ăn, điểm tham quan..."
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm text-gray-900 outline-none transition focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100"
                autoFocus
              />
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                    activeCategory === category
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'border border-gray-200 bg-white text-gray-600 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-2 max-h-[430px] space-y-3 overflow-y-auto pr-1">
              {isSearching &&
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex animate-pulse gap-3 rounded-xl border border-gray-100 p-3"
                  >
                    <div className="h-20 w-24 rounded-lg bg-gray-100" />
                    <div className="flex-1 space-y-3 py-1">
                      <div className="h-4 w-2/3 rounded bg-gray-100" />
                      <div className="h-3 w-full rounded bg-gray-100" />
                      <div className="h-3 w-1/3 rounded bg-gray-100" />
                    </div>
                  </div>
                ))}

              {!isSearching && searchError && (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-50 text-accent-500">
                    <TripIcon name="compass" size={24} />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-gray-900">Kho địa điểm chưa sẵn sàng</p>
                  <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-gray-500">
                    {searchError}
                  </p>
                  <button
                    type="button"
                    onClick={() => setQuery((current) => `${current} `)}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
                  >
                    <TripIcon name="refresh" size={16} />
                    Thử lại
                  </button>
                </div>
              )}

              {!isSearching && !searchError && visibleDestinations.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-12 text-center">
                  <TripIcon name="map-pin" size={28} className="mx-auto text-gray-300" />
                  <p className="mt-3 text-sm font-semibold text-gray-800">Không tìm thấy địa điểm phù hợp</p>
                  <p className="mt-1 text-xs text-gray-500">Thử một từ khóa hoặc danh mục khác.</p>
                </div>
              )}

              {!isSearching &&
                !searchError &&
                visibleDestinations.map((destination) => {
                  const imageUrl = getPrimaryImage(destination);
                  const isSelected = destination.id === selectedDestination?.id;
                  return (
                    <button
                      type="button"
                      key={destination.id}
                      onClick={() => chooseDestination(destination)}
                      className={`group flex w-full gap-3 rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-primary-300 bg-primary-50 shadow-sm ring-2 ring-primary-100'
                          : 'border-gray-100 bg-white hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md'
                      }`}
                    >
                      <div className="relative h-20 w-24 flex-none overflow-hidden rounded-lg bg-gradient-to-br from-primary-100 to-accent-100">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt=""
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <TripIcon
                            name="image"
                            size={22}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-300"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 py-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="truncate text-sm font-bold text-gray-900">{destination.name}</h3>
                          {isSelected && (
                            <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-primary-600 text-white">
                              <TripIcon name="check" size={13} strokeWidth={2.5} />
                            </span>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-1 text-xs text-gray-500">{destination.address}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs">
                          <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
                            <TripIcon name="star" size={14} className="text-warning" />
                            {Number(destination.rating).toFixed(1)}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="font-medium text-primary-700">
                            {Number(destination.ticketPrice) > 0
                              ? formatCurrency(destination.ticketPrice)
                              : 'Miễn phí'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </section>

          <aside className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            {selectedDestination ? (
              <div className="trip-fade-in">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-600">
                  Đang thêm vào lịch trình
                </p>
                <h3 className="mt-2 text-lg font-bold text-gray-900">{selectedDestination.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                  {selectedDestination.address}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <label className="text-xs font-semibold text-gray-700">
                    Bắt đầu
                    <input
                      type="time"
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
                      className="mt-1.5 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                  </label>
                  <label className="text-xs font-semibold text-gray-700">
                    Kết thúc
                    <input
                      type="time"
                      value={endTime}
                      onChange={(event) => setEndTime(event.target.value)}
                      className="mt-1.5 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                  </label>
                </div>

                <label className="mt-4 block text-xs font-semibold text-gray-700">
                  Chi phí dự kiến
                  <div className="relative mt-1.5">
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={estimatedCost}
                      onChange={(event) => setEstimatedCost(event.target.value)}
                      placeholder="0"
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 pr-12 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">VND</span>
                  </div>
                </label>

                <label className="mt-4 block text-xs font-semibold text-gray-700">
                  Ghi chú
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                    placeholder="Món nên thử, vé đã đặt..."
                    className="mt-1.5 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </label>

                {formError && (
                  <p className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                    <TripIcon name="alert-circle" size={15} className="mt-0.5 flex-none" />
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-bold text-white shadow-lg shadow-primary-200 transition hover:-translate-y-0.5 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <TripIcon name={isSubmitting ? 'loader' : 'plus'} size={17} className={isSubmitting ? 'animate-spin' : ''} />
                  {isSubmitting ? 'Đang thêm...' : 'Thêm vào ngày này'}
                </button>
              </div>
            ) : (
              <div className="flex min-h-[330px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-primary-500 shadow-sm">
                  <TripIcon name="map-pin" size={28} />
                </div>
                <h3 className="mt-5 text-base font-bold text-gray-900">Chọn một địa điểm</h3>
                <p className="mt-2 max-w-[220px] text-xs leading-5 text-gray-500">
                  Xem nhanh thông tin, đặt thời gian và chi phí trước khi thêm.
                </p>
              </div>
            )}
          </aside>
        </div>
      </form>
    </Modal>
  );
}
