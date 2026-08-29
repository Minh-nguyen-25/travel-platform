import TripIcon from '@/components/trip/TripIcon';
import type { AiPlannerFormValues } from '@/types/ai.types';
import type { BudgetLevel } from '@/types/preference.types';
import type { TravelMode } from '@/types/trip.types';

interface AiPlannerFormProps {
  values: AiPlannerFormValues;
  isGenerating: boolean;
  isPreferenceLoading: boolean;
  isSavingPreference: boolean;
  preferenceNotice: { tone: 'success' | 'error' | 'muted'; message: string } | null;
  onChange: (values: AiPlannerFormValues) => void;
  onGenerate: () => void;
  onSavePreference: () => void;
}

const budgetOptions: Array<{
  value: BudgetLevel;
  label: string;
  description: string;
}> = [
  { value: 'LOW', label: 'Tiết kiệm', description: 'Ưu tiên miễn phí và chi phí thấp' },
  { value: 'MEDIUM', label: 'Cân bằng', description: 'Thoải mái trong mức hợp lý' },
  { value: 'HIGH', label: 'Cao cấp', description: 'Ưu tiên trải nghiệm tốt nhất' },
];

const travelStyles = [
  { value: 'Thư giãn', label: 'Thư giãn', icon: 'compass' as const },
  { value: 'Cân bằng', label: 'Cân bằng', icon: 'route' as const },
  { value: 'Khám phá', label: 'Khám phá', icon: 'map-pin' as const },
  { value: 'Sôi động', label: 'Sôi động', icon: 'sparkles' as const },
];

const activityOptions = [
  'Tham quan',
  'Ẩm thực địa phương',
  'Chụp ảnh',
  'Mua sắm',
  'Đi bộ khám phá',
  'Hoạt động ngoài trời',
];

const categoryOptions = [
  'Văn hóa',
  'Lịch sử',
  'Thiên nhiên',
  'Ẩm thực',
  'Giải trí',
  'Nghỉ dưỡng',
];

const travelModeOptions: Array<{
  value: TravelMode;
  label: string;
  icon: 'walk' | 'car' | 'bus' | 'bike';
}> = [
  { value: 'WALKING', label: 'Đi bộ', icon: 'walk' },
  { value: 'DRIVING', label: 'Ô tô', icon: 'car' },
  { value: 'TRANSIT', label: 'Công cộng', icon: 'bus' },
  { value: 'CYCLING', label: 'Xe đạp', icon: 'bike' },
];

const localToday = (): string => {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
};

const fieldClass =
  'mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary-400 focus:ring-4 focus:ring-primary-50 disabled:cursor-not-allowed disabled:bg-gray-50';

export default function AiPlannerForm({
  values,
  isGenerating,
  isPreferenceLoading,
  isSavingPreference,
  preferenceNotice,
  onChange,
  onGenerate,
  onSavePreference,
}: AiPlannerFormProps) {
  const visibleActivities = [...new Set([...activityOptions, ...values.preferredActivities])];
  const visibleCategories = [...new Set([...categoryOptions, ...values.preferredCategories])];
  const visibleTravelStyles = values.travelStyle
    && !travelStyles.some((style) => style.value === values.travelStyle)
    ? [...travelStyles, { value: values.travelStyle, label: values.travelStyle, icon: 'star' as const }]
    : travelStyles;

  const update = <Key extends keyof AiPlannerFormValues>(
    key: Key,
    value: AiPlannerFormValues[Key],
  ) => onChange({ ...values, [key]: value });

  const toggleListItem = (
    key: 'preferredActivities' | 'preferredCategories',
    item: string,
  ) => {
    const current = values[key];
    update(key, current.includes(item)
      ? current.filter((value) => value !== item)
      : [...current, item]);
  };

  return (
    <form
      className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-primary-900/5"
      onSubmit={(event) => {
        event.preventDefault();
        onGenerate();
      }}
    >
      <div className="border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white px-5 py-5 sm:px-7">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-200">
            <TripIcon name="sparkles" size={20} />
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Thiết kế chuyến đi</h2>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Cho AI biết bạn muốn đi đâu và trải nghiệm theo cách nào.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 px-5 py-6 sm:px-7 sm:py-7">
        <section aria-labelledby="planner-basics-heading">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-xs font-black text-primary-700">1</span>
            <h3 id="planner-basics-heading" className="text-sm font-extrabold text-gray-900">
              Thông tin hành trình
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-bold text-gray-700">
                Thành phố muốn đến <span className="text-error" aria-hidden="true">*</span>
              </span>
              <span className="relative block">
                <TripIcon name="map-pin" size={17} className="absolute left-3.5 top-[21px] text-primary-500" />
                <input
                  required
                  maxLength={100}
                  autoComplete="address-level2"
                  value={values.destinationCity}
                  onChange={(event) => update('destinationCity', event.target.value)}
                  placeholder="Ví dụ: Đà Nẵng"
                  className={`${fieldClass} pl-10`}
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-gray-700">
                Ngày khởi hành <span className="text-error" aria-hidden="true">*</span>
              </span>
              <input
                required
                type="date"
                min={localToday()}
                value={values.startDate}
                onChange={(event) => update('startDate', event.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-gray-700">
                Số ngày <span className="text-error" aria-hidden="true">*</span>
              </span>
              <input
                required
                type="number"
                min={1}
                max={14}
                value={values.days}
                onChange={(event) => update('days', Number(event.target.value))}
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-gray-700">Số người</span>
              <span className="relative block">
                <TripIcon name="users" size={17} className="absolute left-3.5 top-[21px] text-gray-400" />
                <input
                  type="number"
                  min={1}
                  max={10_000}
                  value={values.numberOfPeople}
                  onChange={(event) => update('numberOfPeople', Number(event.target.value))}
                  className={`${fieldClass} pl-10`}
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-gray-700">Ngân sách dự kiến</span>
              <span className="relative block">
                <input
                  type="number"
                  min={0}
                  max={9_999_999_999.99}
                  step={1_000}
                  inputMode="numeric"
                  value={values.budget}
                  onChange={(event) => update('budget', event.target.value)}
                  placeholder="Không bắt buộc"
                  className={`${fieldClass} pr-12`}
                />
                <span className="pointer-events-none absolute right-3.5 top-[20px] text-xs font-bold text-gray-400">VND</span>
              </span>
            </label>
          </div>
        </section>

        <fieldset>
          <legend className="mb-4 flex items-center gap-2 text-sm font-extrabold text-gray-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-xs font-black text-primary-700">2</span>
            Mức chi tiêu
          </legend>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {budgetOptions.map((option) => {
              const selected = values.budgetLevel === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => update('budgetLevel', option.value)}
                  className={`rounded-2xl border p-3 text-left transition focus:outline-none focus:ring-4 focus:ring-primary-50 ${selected
                    ? 'border-primary-400 bg-primary-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-50/40'
                  }`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${selected ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300 text-transparent'}`}>
                    <TripIcon name="check" size={13} />
                  </span>
                  <span className="mt-2 block text-sm font-extrabold text-gray-900">{option.label}</span>
                  <span className="mt-1 block text-[11px] leading-4 text-gray-500">{option.description}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-4 flex items-center gap-2 text-sm font-extrabold text-gray-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-xs font-black text-primary-700">3</span>
            Phong cách du lịch
          </legend>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {visibleTravelStyles.map((style) => {
              const selected = values.travelStyle === style.value;
              return (
                <button
                  key={style.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => update('travelStyle', style.value)}
                  className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border px-2 text-xs font-bold transition focus:outline-none focus:ring-4 focus:ring-primary-50 ${selected
                    ? 'border-primary-400 bg-primary-600 text-white shadow-md shadow-primary-100'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-primary-200 hover:text-primary-700'
                  }`}
                >
                  <TripIcon name={style.icon} size={20} />
                  {style.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <section aria-labelledby="planner-preferences-heading">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-xs font-black text-primary-700">4</span>
            <h3 id="planner-preferences-heading" className="text-sm font-extrabold text-gray-900">
              Điều bạn yêu thích
            </h3>
          </div>

          <fieldset>
            <legend className="text-xs font-bold uppercase tracking-wide text-gray-500">Hoạt động</legend>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {visibleActivities.map((activity) => {
                const selected = values.preferredActivities.includes(activity);
                return (
                  <button
                    key={activity}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleListItem('preferredActivities', activity)}
                    className={`rounded-full border px-3 py-2 text-xs font-bold transition focus:outline-none focus:ring-4 focus:ring-primary-50 ${selected
                      ? 'border-primary-300 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-primary-200'
                    }`}
                  >
                    {selected && <span aria-hidden="true" className="mr-1">✓</span>}
                    {activity}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="text-xs font-bold uppercase tracking-wide text-gray-500">Loại điểm đến</legend>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {visibleCategories.map((category) => {
                const selected = values.preferredCategories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleListItem('preferredCategories', category)}
                    className={`rounded-full border px-3 py-2 text-xs font-bold transition focus:outline-none focus:ring-4 focus:ring-primary-50 ${selected
                      ? 'border-accent-400 bg-accent-50 text-accent-600'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-accent-100'
                    }`}
                  >
                    {selected && <span aria-hidden="true" className="mr-1">✓</span>}
                    {category}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </section>

        <fieldset>
          <legend className="text-sm font-extrabold text-gray-900">Phương tiện ưu tiên</legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {travelModeOptions.map((mode) => {
              const selected = values.travelMode === mode.value;
              return (
                <button
                  key={mode.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => update('travelMode', mode.value)}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-2 py-2.5 text-xs font-bold transition focus:outline-none focus:ring-4 focus:ring-primary-50 ${selected
                    ? 'border-primary-400 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-500 hover:border-primary-200'
                  }`}
                >
                  <TripIcon name={mode.icon} size={16} />
                  {mode.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="block">
          <span className="text-sm font-extrabold text-gray-900">Yêu cầu thêm</span>
          <span className="mt-1 block text-xs leading-5 text-gray-500">
            Dị ứng, khung giờ nghỉ, địa điểm muốn ưu tiên hoặc điều AI cần lưu ý.
          </span>
          <textarea
            rows={4}
            maxLength={2_000}
            value={values.additionalRequests}
            onChange={(event) => update('additionalRequests', event.target.value)}
            placeholder="Ví dụ: Có trẻ nhỏ, cần nghỉ trưa và hạn chế di chuyển xa..."
            className="mt-2 w-full resize-y rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary-400 focus:ring-4 focus:ring-primary-50"
          />
          <span className="mt-1 block text-right text-[10px] text-gray-400">
            {values.additionalRequests.length}/2.000
          </span>
        </label>
      </div>

      <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-5 sm:px-7">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onSavePreference}
            disabled={isPreferenceLoading || isSavingPreference || isGenerating}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 transition hover:border-primary-200 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <TripIcon
              name={isSavingPreference ? 'loader' : 'check'}
              size={16}
              className={isSavingPreference ? 'animate-spin' : ''}
            />
            {isSavingPreference ? 'Đang lưu...' : 'Lưu sở thích'}
          </button>

          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-6 text-sm font-extrabold text-white shadow-lg shadow-primary-200 transition hover:-translate-y-0.5 hover:from-primary-700 hover:to-primary-800 disabled:cursor-wait disabled:translate-y-0 disabled:opacity-70"
          >
            <TripIcon
              name={isGenerating ? 'loader' : 'sparkles'}
              size={18}
              className={isGenerating ? 'animate-spin' : ''}
            />
            {isGenerating ? 'AI đang thiết kế lịch trình...' : 'Tạo lịch trình bằng AI'}
          </button>
        </div>

        {preferenceNotice && (
          <p
            className={`mt-3 flex items-start gap-2 text-xs leading-5 ${preferenceNotice.tone === 'success'
              ? 'text-success'
              : preferenceNotice.tone === 'error'
                ? 'text-error'
                : 'text-gray-500'
            }`}
            role={preferenceNotice.tone === 'error' ? 'alert' : 'status'}
          >
            <TripIcon
              name={preferenceNotice.tone === 'error' ? 'alert-circle' : 'info'}
              size={14}
              className="mt-0.5 flex-none"
            />
            {preferenceNotice.message}
          </p>
        )}
      </div>
    </form>
  );
}
