import axios from 'axios';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { Link } from 'react-router-dom';
import TripIcon from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { reviewService } from '@/services/review.service';
import type { Pagination } from '@/types/destination.types';
import type { Review } from '@/types/review.types';
import { getApiErrorMessage } from '@/utils/trip.utils';

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const emptyPagination: Pagination = { page: 1, limit: 10, total: 0, totalPages: 0 };

interface ReviewSectionProps {
  destinationId: number;
  destinationName: string;
  averageRating: number;
  onReviewChanged?: () => void | Promise<void>;
}

type SortMode = 'newest' | 'oldest' | 'highest';

const formatReviewDate = (value: string): string =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TripIcon
          key={star}
          name="star"
          size={size}
          className={star <= rating ? 'fill-warning text-warning' : 'fill-gray-100 text-gray-200'}
        />
      ))}
    </span>
  );
}

function Avatar({ review }: { review: Review }) {
  if (review.user.avatarUrl) {
    return (
      <img
        src={review.user.avatarUrl}
        alt=""
        className="h-10 w-10 flex-none rounded-full object-cover"
      />
    );
  }

  return (
    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary-100 text-sm font-black text-primary-700">
      {review.user.fullName.charAt(0).toUpperCase()}
    </span>
  );
}

function ReviewImages({ review }: { review: Review }) {
  if (review.images.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {review.images.map((image) => (
        <a
          key={image.id}
          href={image.imageUrl}
          target="_blank"
          rel="noreferrer"
          className="block h-20 w-20 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <img
            src={image.imageUrl}
            alt={`Ảnh đánh giá của ${review.user.fullName}`}
            className="h-full w-full object-cover transition hover:scale-105"
            loading="lazy"
          />
        </a>
      ))}
    </div>
  );
}

export default function ReviewSection({
  destinationId,
  destinationName,
  averageRating,
  onReviewChanged,
}: ReviewSectionProps) {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<Pagination>(emptyPagination);
  const [page, setPage] = useState(1);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [isListLoading, setIsListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [myReview, setMyReview] = useState<Review | null>(null);
  const [isMyReviewLoading, setIsMyReviewLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);

  const previews = useMemo(
    () => selectedFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [selectedFiles],
  );

  useEffect(() => () => {
    previews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [previews]);

  useEffect(() => {
    setPage(1);
    setMyReview(null);
    setIsEditing(false);
    setRating(0);
    setComment('');
    setSelectedFiles([]);
    setFeedback('');
    setFormError('');
  }, [destinationId]);

  useEffect(() => {
    let active = true;
    const loadReviews = async () => {
      setIsListLoading(true);
      setListError('');
      const sortBy = sortMode === 'highest' ? 'rating' : 'createdAt';
      const sortOrder = sortMode === 'oldest' ? 'asc' : 'desc';

      try {
        const result = await reviewService.getReviews(destinationId, {
          page,
          limit: 10,
          sortBy,
          sortOrder,
        });
        if (!active) return;
        setReviews(result.data);
        setPagination(result.pagination);
      } catch (requestError: unknown) {
        if (!active) return;
        setReviews([]);
        setPagination(emptyPagination);
        setListError(getApiErrorMessage(requestError, 'Không thể tải danh sách đánh giá.'));
      } finally {
        if (active) setIsListLoading(false);
      }
    };

    void loadReviews();
    return () => { active = false; };
  }, [destinationId, page, reloadKey, sortMode]);

  useEffect(() => {
    if (!isAuthenticated) {
      setMyReview(null);
      setIsMyReviewLoading(false);
      return;
    }

    let active = true;
    setIsMyReviewLoading(true);
    reviewService.getMyReview(destinationId)
      .then((review) => {
        if (!active) return;
        setMyReview(review);
        setRating(review.rating);
        setComment(review.comment ?? '');
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        if (axios.isAxiosError(requestError) && requestError.response?.status === 404) {
          setMyReview(null);
          setRating(0);
          setComment('');
          return;
        }
        setFormError(getApiErrorMessage(requestError, 'Không thể tải đánh giá của bạn.'));
      })
      .finally(() => {
        if (active) setIsMyReviewLoading(false);
      });

    return () => { active = false; };
  }, [destinationId, isAuthenticated]);

  const refreshAfterMutation = () => {
    setReloadKey((value) => value + 1);
    void onReviewChanged?.();
  };

  const resetNewImages = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setFormError('');

    const invalidType = files.find((file) => !ACCEPTED_IMAGE_TYPES.has(file.type));
    if (invalidType) {
      setFormError('Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.');
      event.target.value = '';
      return;
    }
    const oversized = files.find((file) => file.size > MAX_IMAGE_SIZE);
    if (oversized) {
      setFormError('Mỗi ảnh phải có dung lượng không quá 5 MB.');
      event.target.value = '';
      return;
    }

    const existingCount = myReview?.images.length ?? 0;
    if (existingCount + selectedFiles.length + files.length > MAX_IMAGES) {
      setFormError(`Mỗi đánh giá chỉ được có tối đa ${MAX_IMAGES} ảnh.`);
      event.target.value = '';
      return;
    }

    setSelectedFiles((current) => [...current, ...files]);
    event.target.value = '';
  };

  const startEditing = () => {
    if (!myReview) return;
    setRating(myReview.rating);
    setComment(myReview.comment ?? '');
    resetNewImages();
    setFormError('');
    setFeedback('');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment ?? '');
    }
    resetNewImages();
    setFormError('');
    setIsEditing(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setFeedback('');
    if (rating < 1 || rating > 5) {
      setFormError('Vui lòng chọn số sao cho trải nghiệm của bạn.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { rating, comment: comment.trim(), images: selectedFiles };
      const savedReview = myReview
        ? await reviewService.updateReview(myReview.id, payload)
        : await reviewService.createReview(destinationId, payload);
      setMyReview(savedReview);
      setRating(savedReview.rating);
      setComment(savedReview.comment ?? '');
      setIsEditing(false);
      resetNewImages();
      setFeedback(myReview ? 'Đã cập nhật đánh giá của bạn.' : 'Cảm ơn bạn đã chia sẻ trải nghiệm!');
      refreshAfterMutation();
    } catch (requestError: unknown) {
      setFormError(getApiErrorMessage(requestError, 'Không thể lưu đánh giá. Vui lòng thử lại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview || !window.confirm('Bạn chắc chắn muốn xóa đánh giá này?')) return;
    setIsDeleting(true);
    setFormError('');
    setFeedback('');
    try {
      await reviewService.deleteReview(myReview.id);
      setMyReview(null);
      setRating(0);
      setComment('');
      setIsEditing(false);
      resetNewImages();
      setFeedback('Đã xóa đánh giá của bạn.');
      refreshAfterMutation();
    } catch (requestError: unknown) {
      setFormError(getApiErrorMessage(requestError, 'Không thể xóa đánh giá.'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!myReview) return;
    setDeletingImageId(imageId);
    setFormError('');
    try {
      const updated = await reviewService.deleteReviewImage(myReview.id, imageId);
      setMyReview(updated);
      refreshAfterMutation();
    } catch (requestError: unknown) {
      setFormError(getApiErrorMessage(requestError, 'Không thể xóa ảnh đánh giá.'));
    } finally {
      setDeletingImageId(null);
    }
  };

  const showForm = isAuthenticated && !isMyReviewLoading && (!myReview || isEditing);

  return (
    <section id="reviews" className="mt-16 scroll-mt-24 border-t border-gray-100 pt-12">
      <div className="grid items-start gap-8 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-12">
        <div className="lg:sticky lg:top-24">
          <p className="text-xs font-extrabold uppercase tracking-normal text-primary-600">
            Cộng đồng du lịch
          </p>
          <h2 className="mt-2 text-2xl font-black text-gray-900">Đánh giá & trải nghiệm</h2>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            Chia sẻ cảm nhận thực tế của bạn về {destinationName}.
          </p>

          <div className="mt-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-6">
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black tracking-tight text-gray-900">
                {averageRating > 0 ? averageRating.toFixed(1) : '—'}
              </span>
              <span className="pb-1 text-sm font-bold text-gray-500">/ 5</span>
            </div>
            <div className="mt-3"><Stars rating={Math.round(averageRating)} size={19} /></div>
            <p className="mt-2 text-xs font-semibold text-gray-500">
              {pagination.total > 0
                ? `${pagination.total} đánh giá đang hiển thị`
                : 'Chưa có đánh giá công khai'}
            </p>
          </div>
        </div>

        <div className="min-w-0 space-y-8">
          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
            {isAuthLoading || isMyReviewLoading ? (
              <div className="space-y-3" aria-label="Đang tải biểu mẫu đánh giá">
                <div className="h-5 w-48 animate-pulse rounded bg-gray-100" />
                <div className="h-24 animate-pulse rounded-2xl bg-gray-50" />
              </div>
            ) : !isAuthenticated ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-black text-gray-900">Bạn đã ghé nơi này?</h3>
                  <p className="mt-1 text-sm text-gray-500">Đăng nhập để viết đánh giá và tải ảnh trải nghiệm.</p>
                </div>
                <Link
                  to={ROUTES.LOGIN}
                  state={{ from: { pathname: `/destinations/${destinationId}` } }}
                  className="inline-flex h-11 flex-none items-center justify-center rounded-xl bg-primary-600 px-5 text-sm font-extrabold text-white hover:bg-primary-700 hover:text-white"
                >
                  Đăng nhập để đánh giá
                </Link>
              </div>
            ) : myReview && !isEditing ? (
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-gray-900">Đánh giá của bạn</h3>
                      {!myReview.isVisible && (
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-extrabold text-red-700">
                          Đã ẩn bởi quản trị viên
                        </span>
                      )}
                    </div>
                    <div className="mt-2"><Stars rating={myReview.rating} size={18} /></div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={startEditing} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 px-3 text-xs font-extrabold text-gray-700 hover:bg-gray-50">
                      <TripIcon name="edit" size={14} /> Chỉnh sửa
                    </button>
                    <button type="button" onClick={() => void handleDeleteReview()} disabled={isDeleting} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-red-100 px-3 text-xs font-extrabold text-red-600 hover:bg-red-50 disabled:opacity-60">
                      <TripIcon name={isDeleting ? 'loader' : 'trash'} size={14} className={isDeleting ? 'animate-spin' : ''} /> Xóa
                    </button>
                  </div>
                </div>
                {myReview.comment && <p className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-600">{myReview.comment}</p>}
                <ReviewImages review={myReview} />
              </div>
            ) : null}

            {showForm && (
              <form onSubmit={(event) => void handleSubmit(event)}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">
                      {myReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá của bạn'}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">Mỗi tài khoản có một đánh giá cho địa điểm này.</p>
                  </div>
                  {myReview && (
                    <button type="button" onClick={cancelEditing} className="text-xs font-extrabold text-gray-500 hover:text-gray-800">
                      Hủy chỉnh sửa
                    </button>
                  )}
                </div>

                <fieldset className="mt-6">
                  <legend className="text-sm font-extrabold text-gray-800">Bạn chấm bao nhiêu sao?</legend>
                  <div className="mt-2 flex w-fit gap-1" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onFocus={() => setHoverRating(star)}
                        onBlur={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="rounded-lg p-1.5 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        aria-label={`${star} sao`}
                        aria-pressed={rating === star}
                      >
                        <TripIcon
                          name="star"
                          size={29}
                          className={star <= (hoverRating || rating) ? 'fill-warning text-warning' : 'fill-gray-100 text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label htmlFor="review-comment" className="mt-5 block text-sm font-extrabold text-gray-800">
                  Chia sẻ trải nghiệm <span className="font-medium text-gray-400">(không bắt buộc)</span>
                </label>
                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  maxLength={5000}
                  rows={4}
                  placeholder="Điều gì khiến chuyến đi của bạn đáng nhớ?"
                  className="mt-2 w-full resize-y rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
                />
                <p className="mt-1 text-right text-[11px] font-semibold text-gray-400">{comment.length}/5000</p>

                {myReview && myReview.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-extrabold text-gray-600">Ảnh đã tải lên</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {myReview.images.map((image) => (
                        <div key={image.id} className="relative h-20 w-20 overflow-hidden rounded-xl border border-gray-100">
                          <img src={image.imageUrl} alt="Ảnh đánh giá" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => void handleDeleteImage(image.id)}
                            disabled={deletingImageId === image.id}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900/80 text-white hover:bg-red-600 disabled:opacity-60"
                            aria-label="Xóa ảnh đã tải lên"
                          >
                            <TripIcon name={deletingImageId === image.id ? 'loader' : 'x'} size={12} className={deletingImageId === image.id ? 'animate-spin' : ''} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {previews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-extrabold text-gray-600">Ảnh mới</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {previews.map(({ file, url }, index) => (
                        <div key={`${file.name}-${file.lastModified}`} className="relative h-20 w-20 overflow-hidden rounded-xl border border-primary-100">
                          <img src={url} alt={file.name} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setSelectedFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900/80 text-white hover:bg-red-600"
                            aria-label={`Bỏ ảnh ${file.name}`}
                          >
                            <TripIcon name="x" size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 text-sm font-extrabold text-gray-600 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700">
                    <TripIcon name="upload" size={17} /> Thêm ảnh
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="sr-only"
                      onChange={handleFiles}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 text-sm font-extrabold text-white shadow-md shadow-primary-200 transition hover:bg-primary-700 disabled:cursor-wait disabled:opacity-60"
                  >
                    <TripIcon name={isSubmitting ? 'loader' : 'check'} size={17} className={isSubmitting ? 'animate-spin' : ''} />
                    {myReview ? 'Lưu thay đổi' : 'Gửi đánh giá'}
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-gray-400">Tối đa 5 ảnh JPG, PNG hoặc WebP; mỗi ảnh không quá 5 MB.</p>
              </form>
            )}

            {formError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{formError}</p>}
            {feedback && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700" role="status">{feedback}</p>}
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-black text-gray-900">
                Tất cả đánh giá <span className="text-base text-gray-400">({pagination.total})</span>
              </h3>
              <select
                value={sortMode}
                onChange={(event) => { setSortMode(event.target.value as SortMode); setPage(1); }}
                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-extrabold text-gray-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                aria-label="Sắp xếp đánh giá"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="highest">Điểm cao nhất</option>
              </select>
            </div>

            {isListLoading ? (
              <div className="mt-4 space-y-3">
                {[1, 2].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl bg-gray-50" />)}
              </div>
            ) : listError ? (
              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
                <p>{listError}</p>
                <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-3 font-extrabold underline">Thử lại</button>
              </div>
            ) : reviews.length === 0 ? (
              <div className="mt-4 rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-warning shadow-sm"><TripIcon name="star" size={23} /></span>
                <p className="mt-4 font-extrabold text-gray-800">Chưa có đánh giá nào</p>
                <p className="mt-1 text-sm text-gray-500">Hãy là người đầu tiên chia sẻ trải nghiệm tại đây.</p>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-gray-100 rounded-3xl border border-gray-100 bg-white px-5 sm:px-6">
                {reviews.map((review) => (
                  <article key={review.id} className="py-6">
                    <div className="flex items-start gap-3">
                      <Avatar review={review} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="truncate text-sm font-black text-gray-900">
                              {review.user.fullName}
                              {user?.id === review.userId && <span className="ml-2 text-xs font-bold text-primary-600">Bạn</span>}
                            </p>
                            <div className="mt-1"><Stars rating={review.rating} /></div>
                          </div>
                          <time dateTime={review.updatedAt} className="text-[11px] font-semibold text-gray-400">
                            {formatReviewDate(review.updatedAt)}
                          </time>
                        </div>
                        {review.comment && <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">{review.comment}</p>}
                        <ReviewImages review={review} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="mt-5 flex items-center justify-between gap-4">
                <button type="button" disabled={page <= 1 || isListLoading} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex h-9 items-center gap-1 rounded-xl border border-gray-200 px-3 text-xs font-extrabold text-gray-700 hover:bg-gray-50 disabled:opacity-40">
                  <TripIcon name="chevron-left" size={14} /> Trước
                </button>
                <span className="text-xs font-bold text-gray-500">Trang {pagination.page}/{pagination.totalPages}</span>
                <button type="button" disabled={page >= pagination.totalPages || isListLoading} onClick={() => setPage((value) => value + 1)} className="inline-flex h-9 items-center gap-1 rounded-xl border border-gray-200 px-3 text-xs font-extrabold text-gray-700 hover:bg-gray-50 disabled:opacity-40">
                  Sau <TripIcon name="chevron-right" size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

