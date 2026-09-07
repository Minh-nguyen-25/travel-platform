import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import type { DestinationUpsertPayload } from '@/types/admin-content.types';
import type { Category, Destination } from '@/types/destination.types';

interface DestinationFormModalProps {
  isOpen: boolean;
  destination: Destination | null;
  categories: Category[];
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (payload: DestinationUpsertPayload) => Promise<void>;
}

interface DestinationFormState {
  name: string;
  description: string;
  address: string;
  phoneNumber: string;
  latitude: string;
  longitude: string;
  ticketPrice: string;
  openingHoursNote: string;
  visitDuration: string;
  isActive: boolean;
  categoryIds: number[];
}

const emptyForm: DestinationFormState = {
  name: '',
  description: '',
  address: '',
  phoneNumber: '',
  latitude: '',
  longitude: '',
  ticketPrice: '0',
  openingHoursNote: '',
  visitDuration: '',
  isActive: true,
  categoryIds: [],
};

const inputClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400';

const buildForm = (destination: Destination | null): DestinationFormState => {
  if (!destination) return emptyForm;
  return {
    name: destination.name,
    description: destination.description ?? '',
    address: destination.address,
    phoneNumber: destination.phoneNumber ?? '',
    latitude: destination.latitude,
    longitude: destination.longitude,
    ticketPrice: destination.ticketPrice,
    openingHoursNote: destination.openingHoursNote ?? '',
    visitDuration: destination.visitDuration?.toString() ?? '',
    isActive: destination.isActive,
    categoryIds: destination.categories.map(({ id }) => id),
  };
};

const FieldLabel = ({ children, required = false }: { children: React.ReactNode; required?: boolean }) => (
  <span className="mb-1.5 block text-sm font-bold text-slate-700">
    {children}{required && <span className="ml-1 text-rose-500">*</span>}
  </span>
);

export default function DestinationFormModal({
  isOpen,
  destination,
  categories,
  isSaving,
  onClose,
  onSubmit,
}: DestinationFormModalProps) {
  const [form, setForm] = useState<DestinationFormState>(emptyForm);
  const [images, setImages] = useState<File[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number | undefined>();
  const [formError, setFormError] = useState('');
  const [imageError, setImageError] = useState('');
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setForm(buildForm(destination));
    setImages([]);
    setPrimaryImageIndex(undefined);
    setFormError('');
    setImageError('');
  }, [destination, isOpen]);

  useEffect(() => {
    const urls = images.map((image) => URL.createObjectURL(image));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [images]);

  const sortedExistingImages = useMemo(
    () => [...(destination?.images ?? [])].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.displayOrder - b.displayOrder),
    [destination],
  );

  const updateField = <K extends keyof DestinationFormState>(
    field: K,
    value: DestinationFormState[K],
  ) => setForm((current) => ({ ...current, [field]: value }));

  const toggleCategory = (categoryId: number) => {
    setForm((current) => ({
      ...current,
      categoryIds: current.categoryIds.includes(categoryId)
        ? current.categoryIds.filter((id) => id !== categoryId)
        : [...current.categoryIds, categoryId],
    }));
  };

  const handleImages = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (selected.length > 5) {
      setImageError('Mỗi lần chỉ được tải lên tối đa 5 ảnh.');
      return;
    }
    const invalid = selected.find(
      (file) => !['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024,
    );
    if (invalid) {
      setImageError('Ảnh phải là JPEG, PNG hoặc WebP và không vượt quá 5 MB.');
      return;
    }
    setImages(selected);
    setPrimaryImageIndex(destination ? undefined : selected.length ? 0 : undefined);
    setImageError('');
  };

  const removeNewImage = (index: number) => {
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
    setPrimaryImageIndex((current) => {
      if (current === undefined) return undefined;
      if (current === index) return destination ? undefined : 0;
      return current > index ? current - 1 : current;
    });
  };

  const validate = (): string => {
    if (!form.name.trim()) return 'Vui lòng nhập tên địa điểm.';
    if (!form.address.trim()) return 'Vui lòng nhập địa chỉ.';
    if (form.categoryIds.length === 0) return 'Vui lòng chọn ít nhất một danh mục.';
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    const ticketPrice = Number(form.ticketPrice);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      return 'Vĩ độ phải là số từ -90 đến 90.';
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return 'Kinh độ phải là số từ -180 đến 180.';
    }
    if (!Number.isFinite(ticketPrice) || ticketPrice < 0) return 'Giá vé không được là số âm.';
    if (form.visitDuration) {
      const duration = Number(form.visitDuration);
      if (!Number.isInteger(duration) || duration <= 0) return 'Thời lượng tham quan phải là số nguyên dương.';
    }
    return '';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validate();
    if (error) {
      setFormError(error);
      return;
    }
    setFormError('');
    await onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      address: form.address.trim(),
      phoneNumber: form.phoneNumber.trim(),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      ticketPrice: Number(form.ticketPrice),
      openingHoursNote: form.openingHoursNote.trim(),
      visitDuration: form.visitDuration ? Number(form.visitDuration) : undefined,
      isActive: form.isActive,
      categoryIds: form.categoryIds,
      images,
      primaryImageIndex,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSaving && onClose()}
      title={destination ? 'Chỉnh sửa địa điểm' : 'Thêm địa điểm mới'}
      size="2xl"
      closeOnBackdrop={!isSaving}
    >
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-7">
        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M6 21V7l6-4 6 4v14M9 10h6M9 14h6M9 18h6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <div><h3 className="font-black text-slate-900">Thông tin cơ bản</h3><p className="text-xs text-slate-500">Tên, địa chỉ và thông tin phục vụ khách tham quan.</p></div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2"><FieldLabel required>Tên địa điểm</FieldLabel><input className={inputClass} value={form.name} onChange={(event) => updateField('name', event.target.value)} maxLength={200} placeholder="Ví dụ: Bảo tàng Chứng tích Chiến tranh" required /></label>
            <label className="md:col-span-2"><FieldLabel required>Địa chỉ</FieldLabel><input className={inputClass} value={form.address} onChange={(event) => updateField('address', event.target.value)} maxLength={500} placeholder="Nhập địa chỉ đầy đủ" required /></label>
            <label className="md:col-span-2"><FieldLabel>Mô tả</FieldLabel><textarea className={`${inputClass} min-h-28 resize-y py-3`} value={form.description} onChange={(event) => updateField('description', event.target.value)} maxLength={10000} placeholder="Giới thiệu ngắn về điểm đến..." /></label>
            <label><FieldLabel>Số điện thoại</FieldLabel><input className={inputClass} value={form.phoneNumber} onChange={(event) => updateField('phoneNumber', event.target.value)} maxLength={20} placeholder="028 1234 5678" /></label>
            <label><FieldLabel>Giá vé (VNĐ)</FieldLabel><input className={inputClass} type="number" min="0" step="1000" value={form.ticketPrice} onChange={(event) => updateField('ticketPrice', event.target.value)} /></label>
            <label><FieldLabel>Giờ mở cửa</FieldLabel><input className={inputClass} value={form.openingHoursNote} onChange={(event) => updateField('openingHoursNote', event.target.value)} maxLength={500} placeholder="Ví dụ: 07:30 - 17:00 hằng ngày" /></label>
            <label><FieldLabel>Thời lượng gợi ý (phút)</FieldLabel><input className={inputClass} type="number" min="1" step="1" value={form.visitDuration} onChange={(event) => updateField('visitDuration', event.target.value)} placeholder="90" /></label>
          </div>
        </section>

        <section className="border-t border-slate-100 pt-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
            </span>
            <div><h3 className="font-black text-slate-900">Vị trí & phân loại</h3><p className="text-xs text-slate-500">Tọa độ được dùng cho bản đồ và nút chỉ đường.</p></div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label><FieldLabel required>Vĩ độ</FieldLabel><input className={inputClass} type="number" min="-90" max="90" step="any" value={form.latitude} onChange={(event) => updateField('latitude', event.target.value)} placeholder="10.776889" required /></label>
            <label><FieldLabel required>Kinh độ</FieldLabel><input className={inputClass} type="number" min="-180" max="180" step="any" value={form.longitude} onChange={(event) => updateField('longitude', event.target.value)} placeholder="106.700806" required /></label>
            <div className="md:col-span-2">
              <FieldLabel required>Danh mục</FieldLabel>
              {categories.length ? (
                <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                  {categories.map((category) => {
                    const selected = form.categoryIds.includes(category.id);
                    return <button key={category.id} type="button" onClick={() => toggleCategory(category.id)} className={`rounded-xl border px-3 py-2 text-xs font-extrabold transition ${selected ? 'border-blue-500 bg-blue-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600'}`}>{selected && <span className="mr-1.5">✓</span>}{category.name}</button>;
                  })}
                </div>
              ) : <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">Chưa có danh mục. Hãy tạo danh mục trước khi thêm địa điểm.</p>}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-100 pt-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 15-4-4L5 20" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <div><h3 className="font-black text-slate-900">Hình ảnh</h3><p className="text-xs text-slate-500">JPEG, PNG hoặc WebP · tối đa 5 ảnh/lần · 5 MB/ảnh.</p></div>
          </div>
          {sortedExistingImages.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-normal text-slate-400">Ảnh hiện tại</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                {sortedExistingImages.map((image) => <div key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100"><img src={image.imageUrl} alt="" className="h-full w-full object-cover" />{image.isPrimary && <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-1 text-[9px] font-black uppercase text-white shadow">Ảnh chính</span>}</div>)}
              </div>
            </div>
          )}
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-6 py-7 text-center transition hover:border-blue-300 hover:bg-blue-50/40">
            <svg className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 16V4m0 0L8 8m4-4 4 4M5 15v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="mt-2 text-sm font-extrabold text-slate-700">Chọn nhiều ảnh từ thiết bị</span>
            <span className="mt-1 text-xs text-slate-400">Ảnh mới sẽ được thêm vào thư viện hiện có</span>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleImages} className="sr-only" />
          </label>
          {imageError && <p className="mt-2 text-xs font-semibold text-rose-600">{imageError}</p>}
          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {previews.map((preview, index) => <div key={preview} className={`group relative aspect-[4/3] overflow-hidden rounded-xl border-2 bg-slate-100 ${primaryImageIndex === index ? 'border-blue-500' : 'border-transparent'}`}><img src={preview} alt={`Ảnh mới ${index + 1}`} className="h-full w-full object-cover" /><button type="button" onClick={() => removeNewImage(index)} className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900/75 text-white transition hover:bg-rose-600" aria-label={`Bỏ ảnh ${index + 1}`}>×</button><button type="button" onClick={() => setPrimaryImageIndex(index)} className={`absolute bottom-1.5 left-1.5 rounded-full px-2 py-1 text-[9px] font-black uppercase shadow ${primaryImageIndex === index ? 'bg-blue-600 text-white' : 'bg-white/90 text-slate-600'}`}>{primaryImageIndex === index ? 'Ảnh chính' : 'Chọn làm chính'}</button></div>)}
            </div>
          )}
        </section>

        <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <span><span className="block text-sm font-extrabold text-slate-800">Hiển thị địa điểm</span><span className="mt-1 block text-xs text-slate-500">Cho phép người dùng tìm kiếm và xem địa điểm này.</span></span>
          <input type="checkbox" checked={form.isActive} onChange={(event) => updateField('isActive', event.target.checked)} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
        </label>

        {formError && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{formError}</div>}

        <div className="sticky bottom-0 -mx-6 -mb-5 flex justify-end gap-2 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>Hủy</Button>
          <Button type="submit" isLoading={isSaving} disabled={categories.length === 0}>{destination ? 'Lưu thay đổi' : 'Thêm địa điểm'}</Button>
        </div>
      </form>
    </Modal>
  );
}
