import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Modal from '@/components/common/Modal';
import TripIcon from '@/components/trip/TripIcon';
import { tripService } from '@/services/trip.service';
import type { CreateTripPayload, TripDetail } from '@/types/trip.types';
import { formatCurrency, getApiErrorMessage, getTripDuration } from '@/utils/trip.utils';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (trip: TripDetail) => void;
}

const toDateInput = (date: Date): string => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

const defaultDates = () => {
  const start = new Date();
  start.setDate(start.getDate() + 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  return { startDate: toDateInput(start), endDate: toDateInput(end) };
};

const buildDays = (startDate: string, endDate: string) => {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  const days: Array<{ date: string }> = [];
  for (let current = start; current <= end; current = new Date(current.getTime() + 86_400_000)) {
    days.push({ date: current.toISOString().slice(0, 10) });
  }
  return days;
};

export default function CreateTripModal({ isOpen, onClose, onCreated }: CreateTripModalProps) {
  const initialDates = useMemo(defaultDates, []);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState(initialDates.startDate);
  const [endDate, setEndDate] = useState(initialDates.endDate);
  const [numberOfPeople, setNumberOfPeople] = useState('2');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) return;
    const dates = defaultDates();
    setName(''); setCity(''); setStartDate(dates.startDate); setEndDate(dates.endDate);
    setNumberOfPeople('2'); setBudget(''); setDescription(''); setError('');
  }, [isOpen]);

  const duration = startDate && endDate && endDate >= startDate
    ? getTripDuration(startDate, endDate)
    : 0;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !city.trim()) {
      setError('Hãy nhập tên chuyến đi và điểm đến.');
      return;
    }
    if (!startDate || !endDate || endDate < startDate) {
      setError('Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.');
      return;
    }
    if (duration > 366) {
      setError('Chuyến đi không thể dài quá 366 ngày.');
      return;
    }
    const people = Number(numberOfPeople);
    const parsedBudget = budget === '' ? null : Number(budget);
    if (!Number.isInteger(people) || people < 1 || people > 10_000) {
      setError('Số người tham gia không hợp lệ.');
      return;
    }
    if (parsedBudget !== null && (!Number.isFinite(parsedBudget) || parsedBudget < 0)) {
      setError('Ngân sách không hợp lệ.');
      return;
    }

    const payload: CreateTripPayload = {
      name: name.trim(),
      destinationCity: city.trim(),
      startDate,
      endDate,
      numberOfPeople: people,
      budget: parsedBudget,
      description: description.trim() || null,
      tripDays: buildDays(startDate, endDate),
    };

    setIsSubmitting(true);
    setError('');
    try {
      const createdTrip = await tripService.createTrip(payload);
      onCreated(createdTrip);
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError, 'Không thể tạo chuyến đi. Vui lòng thử lại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo chuyến đi mới" size="xl" closeOnBackdrop={!isSubmitting}>
      <form onSubmit={(event) => void handleSubmit(event)} className="grid gap-6 md:grid-cols-[minmax(0,1fr)_230px]">
        <div className="space-y-4">
          <label className="block text-xs font-bold text-gray-700">
            Tên chuyến đi <span className="text-error">*</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Đà Nẵng cùng hội bạn" maxLength={200} autoFocus className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-50" />
          </label>
          <label className="block text-xs font-bold text-gray-700">
            Thành phố / điểm đến <span className="text-error">*</span>
            <div className="relative mt-1.5">
              <TripIcon name="map-pin" size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Đà Nẵng" maxLength={100} className="h-11 w-full rounded-xl border border-gray-200 pl-10 pr-3.5 text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-50" />
            </div>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-bold text-gray-700">Ngày bắt đầu<input type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); if (event.target.value > endDate) setEndDate(event.target.value); }} className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-50" /></label>
            <label className="text-xs font-bold text-gray-700">Ngày kết thúc<input type="date" min={startDate} value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-50" /></label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-bold text-gray-700">Số người<input type="number" min="1" max="10000" value={numberOfPeople} onChange={(event) => setNumberOfPeople(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-50" /></label>
            <label className="text-xs font-bold text-gray-700">Ngân sách<div className="relative mt-1.5"><input type="number" min="0" step="100000" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="10.000.000" className="h-11 w-full rounded-xl border border-gray-200 px-3 pr-11 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-50" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">VND</span></div></label>
          </div>
          <label className="block text-xs font-bold text-gray-700">Ghi chú<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} maxLength={10000} placeholder="Điều bạn mong chờ ở chuyến đi này..." className="mt-1.5 w-full resize-none rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-50" /></label>
          {error && <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-3 text-xs font-medium text-red-700"><TripIcon name="alert-circle" size={15} className="mt-0.5 flex-none" />{error}</p>}
        </div>

        <aside className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-800 via-primary-600 to-primary-400 p-5 text-white">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-white/15" />
          <div className="relative">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm"><TripIcon name="suitcase" size={20} /></span>
            <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-100">Xem trước</p>
            <h3 className="mt-2 break-words text-xl font-extrabold text-white">{name.trim() || 'Chuyến đi mới'}</h3>
            <p className="mt-1 text-sm font-semibold text-primary-100">{city.trim() || 'Điểm đến của bạn'}</p>
            <div className="mt-6 space-y-3 border-t border-white/15 pt-5 text-xs text-primary-50">
              <p className="flex items-center gap-2"><TripIcon name="calendar" size={15} />{duration || 0} ngày</p>
              <p className="flex items-center gap-2"><TripIcon name="users" size={15} />{numberOfPeople || 0} người</p>
              <p className="flex items-center gap-2"><TripIcon name="wallet" size={15} />{budget ? formatCurrency(budget) : 'Chưa đặt ngân sách'}</p>
            </div>
            <p className="mt-8 rounded-xl bg-white/10 p-3 text-[11px] leading-5 text-primary-50">Các ngày sẽ được tạo sẵn để bạn mở planner và thêm địa điểm ngay.</p>
          </div>
        </aside>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 md:col-span-2">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="h-10 rounded-xl border border-gray-200 px-4 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Hủy</button>
          <button type="submit" disabled={isSubmitting} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-bold text-white shadow-md shadow-primary-200 transition hover:-translate-y-0.5 hover:bg-primary-700 disabled:opacity-60">
            <TripIcon name={isSubmitting ? 'loader' : 'sparkles'} size={16} className={isSubmitting ? 'animate-spin' : ''} />{isSubmitting ? 'Đang tạo...' : 'Tạo chuyến đi'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
