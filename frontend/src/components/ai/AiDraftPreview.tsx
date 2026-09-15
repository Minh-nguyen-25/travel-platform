import type { AiChatResult } from '../../types/ai.types';

interface Props {
  draft: NonNullable<AiChatResult['draft']>;
  onSave: () => void;
  isSaving: boolean;
  savedTripId: number | null;
  error: string;
}

const money = (value: number): string => `${new Intl.NumberFormat('vi-VN').format(value)} ₫`;

export default function AiDraftPreview({ draft, onSave, isSaving, savedTripId, error }: Props) {
  const { itinerary, tripDraft, warnings, budgetLevel } = draft;
  const budgetLabel = budgetLevel === 'LOW' ? 'tiết kiệm'
    : budgetLevel === 'MEDIUM' ? 'trung bình' : budgetLevel === 'HIGH' ? 'cao' : null;
  return (
    <section className="mt-4 rounded-2xl border border-primary-100 bg-primary-50/70 p-4 text-gray-700" aria-label="Bản nháp lịch trình">
      <p className="text-[11px] font-bold uppercase tracking-wide text-primary-700">Bản nháp · Xem trước khi lưu</p>
      <h3 className="mt-1 text-base font-extrabold text-gray-900">{itinerary.title}</h3>
      <p className="mt-1 text-xs leading-5">{itinerary.summary}</p>
      <p className="mt-2 text-xs font-semibold">Bắt đầu {tripDraft.startDate} · {itinerary.days.length} ngày · Ước tính {money(itinerary.totalEstimatedCost)}</p>
      <p className="mt-1 text-xs font-semibold">{tripDraft.numberOfPeople} người
        {tripDraft.budget != null ? ` · Ngân sách ${money(tripDraft.budget)}` : budgetLabel ? ` · Mức chi tiêu ${budgetLabel}` : ''}
      </p>
      <ol className="mt-3 space-y-2">
        {itinerary.days.map((day) => (
          <li key={day.dayNumber} className="rounded-xl border border-primary-100 bg-white p-3">
            <p className="text-xs font-bold text-primary-800">Ngày {day.dayNumber} · {day.date} · {day.theme}</p>
            <ul className="mt-1 space-y-1 text-xs">
              {day.activities.map((activity) => (
                <li key={`${day.dayNumber}-${activity.destinationId}-${activity.sequenceOrder}`}>
                  {activity.startTime}–{activity.endTime} ·{' '}
                  <a href={`/destinations/${activity.destinationId}`} className="font-semibold text-primary-700 underline-offset-2 hover:underline">
                    {activity.destinationName}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      {warnings.length > 0 && <p className="mt-3 text-xs text-amber-800">{warnings.join(' ')}</p>}
      {error && <p className="mt-3 text-xs text-red-700" role="alert">{error}</p>}
      {savedTripId ? (
        <a href={`/trips/${savedTripId}`} className="mt-4 inline-flex rounded-xl bg-primary-700 px-4 py-2.5 text-xs font-bold text-white">Xem chuyến đi đã lưu</a>
      ) : (
        <button type="button" onClick={onSave} disabled={isSaving}
          className="mt-4 rounded-xl bg-primary-700 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
          {isSaving ? 'Đang lưu…' : 'Lưu chuyến đi'}
        </button>
      )}
    </section>
  );
}
