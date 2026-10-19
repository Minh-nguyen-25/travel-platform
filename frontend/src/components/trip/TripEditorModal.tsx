import { useState, type FormEvent } from 'react';
import Modal from '@/components/common/Modal';
import { tripService } from '@/services/trip.service';
import type { Destination, Itinerary, TripDay, TripDetail, TravelMode } from '@/types/trip.types';
import { getApiErrorMessage } from '@/utils/trip.utils';

export type TripEditorTarget = { kind: 'trip' } | { kind: 'day'; day: TripDay } | { kind: 'activity'; day: TripDay; activity: Itinerary };
interface Props { trip: TripDetail; target: TripEditorTarget; onClose: () => void; onSaved: () => Promise<void> }
const field = 'mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm';
const button = 'rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold disabled:opacity-50';

export default function TripEditorModal({ trip, target, onClose, onSaved }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Destination[]>([]);
  const [searching, setSearching] = useState(false);
  const [destination, setDestination] = useState<Destination | null>(target.kind === 'activity' ? target.activity.destination : null);
  const activity = target.kind === 'activity' ? target.activity : null;
  const close = () => { if (!busy) onClose(); };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (key: string) => String(data.get(key) ?? '').trim();
    setBusy(true); setError('');
    try {
      if (target.kind === 'trip') {
        await tripService.updateTrip(trip.id, {
          name: text('name'), destinationCity: text('destinationCity'), startDate: text('startDate'), endDate: text('endDate'),
          numberOfPeople: Number(text('numberOfPeople')), budget: text('budget') ? Number(text('budget')) : null,
          description: text('description') || null,
        });
      } else if (target.kind === 'day') {
        await tripService.updateTripDay(trip.id, target.day.id, { date: text('date'), note: text('note') || null });
      } else {
        await tripService.updateItinerary(trip.id, target.day.id, target.activity.id, {
          destinationId: destination!.id, startTime: text('startTime') || null, endTime: text('endTime') || null,
          estimatedCost: Number(text('estimatedCost')), travelMode: (text('travelMode') || null) as TravelMode | null,
          note: text('note') || null,
          // A changed destination or mode invalidates the incoming leg.
          ...(destination!.id !== target.activity.destinationId || text('travelMode') !== (target.activity.travelMode ?? '')
            ? { travelDistanceKm: null, travelDurationMinutes: null } : {}),
        });
      }
      await onSaved(); onClose();
    } catch (requestError) { setError(getApiErrorMessage(requestError, 'Không thể lưu thay đổi.')); }
    finally { setBusy(false); }
  };

  const deleteDay = async () => {
    if (target.kind !== 'day') return;
    setBusy(true); setError('');
    try { await tripService.deleteTripDay(trip.id, target.day.id); await onSaved(); onClose(); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Không thể xóa ngày.')); }
    finally { setBusy(false); }
  };

  const searchDestinations = async () => {
    setSearching(true); setError('');
    try { setResults((await tripService.searchDestinations({ search, limit: 10 })).data); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Không thể tìm địa điểm.')); }
    finally { setSearching(false); }
  };

  return <Modal isOpen onClose={close} title={target.kind === 'trip' ? 'Chỉnh chuyến đi' : target.kind === 'day' ? 'Chỉnh ngày' : 'Chỉnh hoạt động'} size="lg" closeOnBackdrop={!busy}>
    <form onSubmit={(event) => void save(event)} className="space-y-4">
      <fieldset disabled={busy} className="space-y-4">
        {target.kind === 'trip' && <>
          <label className="block text-sm font-semibold">Tên chuyến đi<input name="name" required maxLength={200} defaultValue={trip.name} className={field} /></label>
          <label className="block text-sm font-semibold">Thành phố<input name="destinationCity" required maxLength={100} defaultValue={trip.destinationCity} className={field} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-semibold">Bắt đầu<input name="startDate" type="date" required defaultValue={trip.startDate} className={field} /></label>
            <label className="text-sm font-semibold">Kết thúc<input name="endDate" type="date" required defaultValue={trip.endDate} className={field} /></label>
          </div>
          <p className="text-xs text-gray-500">Đổi ngày bắt đầu sẽ dịch các ngày có lịch tương ứng. Ngày kết thúc phải bao gồm mọi ngày có lịch.</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-semibold">Số người<input name="numberOfPeople" type="number" min={1} max={10000} required defaultValue={trip.numberOfPeople} className={field} /></label>
            <label className="text-sm font-semibold">Ngân sách (VND)<input name="budget" type="number" min={0} step="0.01" max={9999999999.99} defaultValue={trip.budget ?? ''} className={field} /></label>
          </div>
          <label className="block text-sm font-semibold">Mô tả<textarea name="description" maxLength={10000} defaultValue={trip.description ?? ''} className={field} rows={3} /></label>
        </>}
        {target.kind === 'day' && <>
          <label className="block text-sm font-semibold">Ngày<input name="date" type="date" min={trip.startDate} max={trip.endDate} required defaultValue={target.day.date} className={field} /></label>
          <label className="block text-sm font-semibold">Ghi chú<textarea name="note" maxLength={5000} defaultValue={target.day.note ?? ''} className={field} rows={3} /></label>
          {confirmDelete ? <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <p>Xóa ngày này cùng {target.day.itineraries.length} hoạt động? Chi phí thực tế vẫn được giữ trong sổ chi phí.</p>
            <button type="button" onClick={() => void deleteDay()} className={`${button} mt-2`}>Xác nhận xóa ngày</button>
            <button type="button" onClick={() => setConfirmDelete(false)} className={`${button} ml-2`}>Giữ lại</button>
          </div> : <button type="button" onClick={() => setConfirmDelete(true)} className={`${button} text-red-600`}>Xóa ngày này</button>}
        </>}
        {activity && <>
          <p className="font-bold">{destination?.name}</p>
          <div className="flex gap-2"><input aria-label="Tìm địa điểm thay thế" placeholder="Tìm địa điểm thay thế" value={search} onChange={(event) => setSearch(event.target.value)} className={field} />
            <button type="button" onClick={() => void searchDestinations()} disabled={searching} className={button}>{searching ? 'Đang tìm…' : 'Tìm'}</button></div>
          {results.length > 0 && <select aria-label="Địa điểm thay thế" className={field} value={destination?.id} onChange={(event) => setDestination(results.find((item) => item.id === Number(event.target.value)) ?? destination)}>
            {!results.some((item) => item.id === destination?.id) && <option value={destination?.id}>{destination?.name}</option>}
            {results.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.address}</option>)}
          </select>}
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-semibold">Giờ bắt đầu<input name="startTime" type="time" defaultValue={activity.startTime?.slice(0, 5) ?? ''} className={field} /></label>
            <label className="text-sm font-semibold">Giờ kết thúc<input name="endTime" type="time" defaultValue={activity.endTime?.slice(0, 5) ?? ''} className={field} /></label>
          </div>
          <label className="block text-sm font-semibold">Dự toán (VND)<input name="estimatedCost" type="number" min={0} max={9999999999.99} step="0.01" required defaultValue={activity.estimatedCost} className={field} /></label>
          <label className="block text-sm font-semibold">Di chuyển đến điểm này<select name="travelMode" defaultValue={activity.travelMode ?? ''} className={field}>
            <option value="">Chưa chọn</option><option value="WALKING">Đi bộ</option><option value="CYCLING">Xe đạp</option><option value="DRIVING">Ô tô</option><option value="TRANSIT">Công cộng</option>
          </select></label>
          <label className="block text-sm font-semibold">Ghi chú<textarea name="note" maxLength={5000} defaultValue={activity.note ?? ''} className={field} rows={3} /></label>
        </>}
      </fieldset>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3"><button type="button" disabled={busy} onClick={close} className={button}>Hủy</button>
        <button type="submit" disabled={busy} className={`${button} bg-primary-600 text-white`}>{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</button></div>
    </form>
  </Modal>;
}
