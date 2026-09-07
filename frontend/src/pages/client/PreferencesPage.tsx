import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AiItineraryResult from '@/components/ai/AiItineraryResult';
import AiPlannerForm from '@/components/ai/AiPlannerForm';
import EditorialPageHero from '@/components/common/EditorialPageHero';
import TripIcon from '@/components/trip/TripIcon';
import { aiService } from '@/services/ai.service';
import { preferenceService } from '@/services/preference.service';
import type {
  AiItineraryGenerationResult,
  AiPlannerFormValues,
  GenerateItineraryPayload,
} from '@/types/ai.types';
import type { TravelPreferencePayload } from '@/types/preference.types';
import { getApiErrorMessage } from '@/utils/trip.utils';

type PreferenceNotice = {
  tone: 'success' | 'error' | 'muted';
  message: string;
};

const tomorrowDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
};

const initialValues: AiPlannerFormValues = {
  destinationCity: '',
  startDate: tomorrowDate(),
  days: 3,
  numberOfPeople: 2,
  budgetLevel: 'MEDIUM',
  budget: '',
  travelStyle: 'Cân bằng',
  preferredActivities: ['Tham quan', 'Ẩm thực địa phương'],
  preferredCategories: ['Văn hóa', 'Ẩm thực'],
  travelMode: 'DRIVING',
  additionalRequests: '',
};

const toPreferencePayload = (values: AiPlannerFormValues): TravelPreferencePayload => ({
  budgetLevel: values.budgetLevel,
  travelStyle: values.travelStyle.trim() || null,
  preferredActivities: values.preferredActivities,
  preferredCategories: values.preferredCategories,
});

const toGeneratePayload = (values: AiPlannerFormValues): GenerateItineraryPayload => {
  const budget = values.budget === '' ? undefined : Number(values.budget);
  return {
    destinationCity: values.destinationCity.trim(),
    startDate: values.startDate,
    days: values.days,
    numberOfPeople: values.numberOfPeople,
    budgetLevel: values.budgetLevel,
    ...(budget === undefined ? {} : { budget }),
    travelStyle: values.travelStyle,
    // The AI endpoint intentionally accepts fewer prompt items than preference storage.
    preferredActivities: values.preferredActivities.slice(0, 20),
    preferredCategories: values.preferredCategories.slice(0, 20),
    travelMode: values.travelMode,
    ...(values.additionalRequests.trim()
      ? { additionalRequests: values.additionalRequests.trim() }
      : {}),
    locale: 'vi-VN',
  };
};

function GeneratingState() {
  return (
    <div
      className="mt-6 overflow-hidden rounded-3xl border border-primary-100 bg-white p-6 shadow-lg shadow-primary-900/5 sm:p-8"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center text-center">
        <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-xl shadow-primary-200">
          <span className="absolute inset-0 animate-ping rounded-2xl bg-primary-300 opacity-20" />
          <TripIcon name="sparkles" size={27} className="relative" />
        </span>
        <h2 className="mt-5 text-xl font-extrabold text-gray-900">AI đang ghép hành trình phù hợp nhất</h2>
        <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">
          Đang chọn địa điểm, sắp khung giờ và tính tuyến đường. Quá trình này có thể mất khoảng một phút.
        </p>
        <div className="mt-6 grid w-full max-w-xl gap-2.5 sm:grid-cols-3">
          {['Chọn địa điểm', 'Tối ưu lịch trình', 'Ước tính chi phí'].map((label, index) => (
            <div key={label} className="flex items-center gap-2 rounded-xl bg-primary-50 px-3 py-2.5 text-left text-xs font-bold text-primary-700">
              <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-primary-600 text-[10px] text-white">{index + 1}</span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PreferencesPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<AiPlannerFormValues>(initialValues);
  const [result, setResult] = useState<AiItineraryGenerationResult | null>(null);
  const [isPreferenceLoading, setIsPreferenceLoading] = useState(true);
  const [preferenceExists, setPreferenceExists] = useState(false);
  const [isSavingPreference, setIsSavingPreference] = useState(false);
  const [preferenceNotice, setPreferenceNotice] = useState<PreferenceNotice | null>({
    tone: 'muted',
    message: 'Đang tải sở thích đã lưu của bạn...',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [isSavingTrip, setIsSavingTrip] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadPreference = async () => {
      try {
        const preference = await preferenceService.getPreference();
        if (!isActive) return;

        if (!preference) {
          setPreferenceNotice({
            tone: 'muted',
            message: 'Bạn chưa lưu sở thích. Chọn các mục phù hợp rồi lưu để dùng cho lần sau.',
          });
          return;
        }

        setPreferenceExists(true);
        setValues((current) => ({
          ...current,
          budgetLevel: preference.budgetLevel ?? current.budgetLevel,
          travelStyle: preference.travelStyle ?? current.travelStyle,
          preferredActivities: preference.preferredActivities ?? [],
          preferredCategories: preference.preferredCategories ?? [],
        }));
        setPreferenceNotice({ tone: 'success', message: 'Đã áp dụng sở thích bạn lưu trước đó.' });
      } catch (error: unknown) {
        if (!isActive) return;
        setPreferenceNotice({
          tone: 'error',
          message: getApiErrorMessage(
            error,
            'Chưa thể tải sở thích đã lưu. Bạn vẫn có thể tạo lịch trình bình thường.',
          ),
        });
      } finally {
        if (isActive) setIsPreferenceLoading(false);
      }
    };

    void loadPreference();
    return () => { isActive = false; };
  }, []);

  const handleSavePreference = async () => {
    setIsSavingPreference(true);
    setPreferenceNotice(null);
    try {
      await preferenceService.savePreference(toPreferencePayload(values), preferenceExists);
      setPreferenceExists(true);
      setPreferenceNotice({ tone: 'success', message: 'Đã lưu sở thích du lịch của bạn.' });
    } catch (error: unknown) {
      setPreferenceNotice({
        tone: 'error',
        message: getApiErrorMessage(error, 'Chưa thể lưu sở thích. Vui lòng thử lại.'),
      });
    } finally {
      setIsSavingPreference(false);
    }
  };

  const handleGenerate = async () => {
    setGenerateError('');
    setSaveError('');

    if (!values.destinationCity.trim()) {
      setGenerateError('Vui lòng nhập thành phố bạn muốn đến.');
      return;
    }
    if (!values.startDate) {
      setGenerateError('Vui lòng chọn ngày khởi hành để có thể lưu chuyến đi.');
      return;
    }
    if (!Number.isInteger(values.days) || values.days < 1 || values.days > 14) {
      setGenerateError('Số ngày phải từ 1 đến 14.');
      return;
    }
    if (!Number.isInteger(values.numberOfPeople) || values.numberOfPeople < 1) {
      setGenerateError('Số người phải ít nhất là 1.');
      return;
    }
    if (values.budget !== '' && (!Number.isFinite(Number(values.budget)) || Number(values.budget) < 0)) {
      setGenerateError('Ngân sách dự kiến không hợp lệ.');
      return;
    }

    setResult(null);
    setIsGenerating(true);
    try {
      const generated = await aiService.generateItinerary(toGeneratePayload(values));
      setResult(generated);
      window.requestAnimationFrame(() => {
        document.getElementById('ai-planner-output')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    } catch (error: unknown) {
      setGenerateError(getApiErrorMessage(
        error,
        'Chưa thể tạo lịch trình lúc này. Vui lòng kiểm tra thông tin và thử lại.',
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!result?.tripDraft) {
      setSaveError('Bản nháp chưa sẵn sàng để lưu. Hãy tạo lại lịch trình với ngày khởi hành.');
      return;
    }

    setIsSavingTrip(true);
    setSaveError('');
    try {
      // The proof signs the exact draft, so it must be posted without reconstruction.
      const trip = await aiService.saveTripDraft(result.tripDraft);
      navigate(`/trips/${trip.id}`);
    } catch (error: unknown) {
      setSaveError(getApiErrorMessage(
        error,
        'Chưa thể lưu chuyến đi. Bản nháp vẫn còn ở đây để bạn thử lại.',
      ));
    } finally {
      setIsSavingTrip(false);
    }
  };

  const returnToPlanner = () => {
    setResult(null);
    setSaveError('');
    window.requestAnimationFrame(() => {
      document.getElementById('ai-planner-form')?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  return (
    <div className="trip-page-bg min-h-screen pb-24">
      <EditorialPageHero
        eyebrow="AI Travel Planner"
        title={<>Một hành trình <span className="text-primary-200">vừa vặn với bạn.</span></>}
        description="Chọn ngân sách, phong cách và sở thích. AI sẽ xây lịch trình từng ngày, cân đối chi phí và quãng đường trong vài phút."
        image="/images/vietnam-ai-planner.jpg"
        imageAlt="Bản đồ Việt Nam và dụng cụ du lịch dưới ánh đèn lồng"
        icon="sparkles"
        motion="orbit"
        imagePosition="object-[62%_50%]"
        compact
      >
        <div className="flex flex-wrap gap-3 text-xs font-bold text-white/72">
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">Cá nhân hóa sở thích</span>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">Cân đối ngân sách</span>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">Tối ưu quãng đường</span>
        </div>
      </EditorialPageHero>

      <main id="ai-planner-output" className="container scroll-mt-24 py-8 sm:py-10">
        {result ? (
          <AiItineraryResult
            key={result.metadata.generatedAt}
            result={result}
            isSaving={isSavingTrip}
            saveError={saveError}
            onEdit={returnToPlanner}
            onRegenerate={() => void handleGenerate()}
            onSave={() => void handleSaveTrip()}
          />
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div id="ai-planner-form" className="scroll-mt-24">
              <AiPlannerForm
                values={values}
                isGenerating={isGenerating}
                isPreferenceLoading={isPreferenceLoading}
                isSavingPreference={isSavingPreference}
                preferenceNotice={preferenceNotice}
                onChange={setValues}
                onGenerate={() => void handleGenerate()}
                onSavePreference={() => void handleSavePreference()}
              />

              {generateError && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm leading-6 text-error" role="alert">
                  <TripIcon name="alert-circle" size={18} className="mt-0.5 flex-none" />
                  <div>
                    <p className="font-extrabold">Chưa thể tạo lịch trình</p>
                    <p className="mt-0.5 text-xs">{generateError}</p>
                  </div>
                </div>
              )}

              {isGenerating && <GeneratingState />}
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24" aria-label="Thông tin về AI Planner">
              <div className="rounded-3xl border border-primary-100 bg-primary-900 p-5 text-white shadow-lg">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <TripIcon name="route" size={19} />
                </span>
                <h2 className="mt-4 text-lg font-extrabold">AI sẽ lo phần khó</h2>
                <ul className="mt-4 space-y-3">
                  {[
                    'Chọn địa điểm phù hợp sở thích',
                    'Sắp thời gian không chồng chéo',
                    'Tính quãng đường giữa các điểm',
                    'Ước tính tổng chi phí hành trình',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-xs leading-5 text-primary-100">
                      <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-success/20 text-success">
                        <TripIcon name="check" size={12} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                    <TripIcon name="info" size={17} />
                  </span>
                  <div>
                    <h2 className="text-sm font-extrabold text-gray-900">Mẹo nhỏ</h2>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Thêm yêu cầu cụ thể như “đi cùng trẻ nhỏ” hoặc “không ăn hải sản” để lịch trình sát nhu cầu hơn.
                    </p>
                  </div>
                </div>
              </div>

              <p className="px-2 text-center text-[10px] leading-4 text-gray-400">
                AI chỉ đưa ra gợi ý. Hãy kiểm tra giờ mở cửa, thời tiết và giá vé trước chuyến đi.
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
