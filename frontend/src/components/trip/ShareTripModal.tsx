import { useEffect, useState } from 'react';
import Modal from '@/components/common/Modal';
import TripIcon, { type IconName } from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';
import { tripService } from '@/services/trip.service';
import { getApiErrorMessage } from '@/utils/trip.utils';

interface ShareState {
  isPublic: boolean;
  shareToken: string | null;
}

interface ShareTripModalProps extends ShareState {
  isOpen: boolean;
  tripId: number;
  tripName: string;
  onClose: () => void;
  onChanged: (state: ShareState) => void;
}

export default function ShareTripModal({
  isOpen,
  tripId,
  tripName,
  isPublic,
  shareToken,
  onClose,
  onChanged,
}: ShareTripModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const shareUrl = shareToken
    ? `${window.location.origin}${ROUTES.SHARED_TRIP(shareToken)}`
    : '';

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setError('');
    }
  }, [isOpen]);

  const enableSharing = async () => {
    setIsUpdating(true);
    setError('');
    try {
      const state = await tripService.enableShare(tripId);
      onChanged({ isPublic: state.isPublic, shareToken: state.shareToken });
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError, 'Không thể tạo liên kết chia sẻ.'));
    } finally {
      setIsUpdating(false);
    }
  };

  const disableSharing = async () => {
    setIsUpdating(true);
    setError('');
    try {
      await tripService.disableShare(tripId);
      onChanged({ isPublic: false, shareToken: null });
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError, 'Không thể thu hồi liên kết chia sẻ.'));
    } finally {
      setIsUpdating(false);
    }
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Trình duyệt không cho phép sao chép tự động. Hãy chọn và sao chép liên kết.');
    }
  };

  const shareNatively = async () => {
    if (!shareUrl || !navigator.share) return;
    try {
      await navigator.share({
        title: tripName,
        text: `Cùng xem lịch trình ${tripName}`,
        url: shareUrl,
      });
    } catch {
      // The user can dismiss the native share sheet; no error state is needed.
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chia sẻ chuyến đi" size="lg">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 p-6 text-white">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border border-white/20" />
        <div className="absolute -bottom-12 right-16 h-24 w-24 rounded-full bg-white/10" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <TripIcon name="share" size={21} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">
              {isPublic && shareToken ? 'Chuyến đi đang được chia sẻ' : 'Mời bạn bè cùng xem'}
            </h3>
            <p className="mt-1 text-sm leading-6 text-primary-100">
              Link chỉ cho phép xem. Bạn vẫn là người duy nhất có thể chỉnh sửa lịch trình.
            </p>
          </div>
        </div>
      </div>

      {isPublic && shareToken ? (
        <div className="trip-fade-in mt-6">
          <label className="text-xs font-bold uppercase tracking-normal text-gray-500">
            Liên kết công khai
          </label>
          <div className="mt-2 flex rounded-xl border border-gray-200 bg-gray-50 p-1.5 focus-within:border-primary-300 focus-within:ring-4 focus-within:ring-primary-50">
            <input
              value={shareUrl}
              readOnly
              onFocus={(event) => event.currentTarget.select()}
              className="min-w-0 flex-1 bg-transparent px-2 text-sm text-gray-600 outline-none"
              aria-label="Liên kết chia sẻ chuyến đi"
            />
            <button
              type="button"
              onClick={() => void copyLink()}
              className={`inline-flex h-9 flex-none items-center gap-2 rounded-lg px-3 text-xs font-bold transition ${
                copied
                  ? 'bg-success text-white'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              <TripIcon name={copied ? 'check' : 'copy'} size={15} />
              {copied ? 'Đã sao chép' : 'Sao chép'}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {'share' in navigator && (
              <button
                type="button"
                onClick={() => void shareNatively()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
              >
                <TripIcon name="external-link" size={17} />
                Chia sẻ qua...
              </button>
            )}
            <a
              href={ROUTES.SHARED_TRIP(shareToken)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
            >
              <TripIcon name="eye" size={17} />
              Xem trang chia sẻ
            </a>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-gray-100 pt-5">
            <div>
              <p className="text-sm font-bold text-gray-800">Ngừng chia sẻ?</p>
              <p className="mt-0.5 text-xs text-gray-500">Liên kết hiện tại sẽ hết hiệu lực ngay.</p>
            </div>
            <button
              type="button"
              onClick={() => void disableSharing()}
              disabled={isUpdating}
              className="inline-flex h-9 flex-none items-center gap-2 rounded-lg px-3 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              <TripIcon name={isUpdating ? 'loader' : 'unlink'} size={15} className={isUpdating ? 'animate-spin' : ''} />
              Thu hồi link
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <div className="space-y-3">
            {([
              ['eye', 'Chế độ chỉ xem', 'Bạn bè không thể sửa hay xóa kế hoạch.'],
              ['link', 'Một link tiện lợi', 'Ai có link đều có thể mở mà không cần đăng nhập.'],
              ['unlink', 'Thu hồi bất cứ lúc nào', 'Tắt chia sẻ ngay khi bạn muốn.'],
            ] satisfies Array<[IconName, string, string]>).map(([icon, title, description]) => (
              <div key={title} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <TripIcon name={icon} size={17} />
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-800">{title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void enableSharing()}
            disabled={isUpdating}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-bold text-white shadow-lg shadow-primary-200 transition hover:-translate-y-0.5 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <TripIcon name={isUpdating ? 'loader' : 'link'} size={17} className={isUpdating ? 'animate-spin' : ''} />
            {isUpdating ? 'Đang tạo liên kết...' : 'Bật chia sẻ công khai'}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700">
          <TripIcon name="alert-circle" size={15} className="mt-0.5 flex-none" />
          {error}
        </p>
      )}
    </Modal>
  );
}
