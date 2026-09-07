import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TripIcon from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { favoriteService } from '@/services/favorite.service';
import { getApiErrorMessage } from '@/utils/trip.utils';

interface FavoriteButtonProps {
  destinationId: number;
  initialIsFavorite?: boolean;
  showLabel?: boolean;
  className?: string;
  onChange?: (isFavorite: boolean) => void;
}

export default function FavoriteButton({
  destinationId,
  initialIsFavorite,
  showLabel = false,
  className = '',
  onChange,
}: FavoriteButtonProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite ?? false);
  const [isLoading, setIsLoading] = useState(
    isAuthenticated && initialIsFavorite === undefined,
  );
  const [error, setError] = useState('');

  useEffect(() => {
    setIsFavorite(initialIsFavorite ?? false);
    setError('');

    if (!isAuthenticated || initialIsFavorite !== undefined) {
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    favoriteService.getStatus(destinationId)
      .then((status) => {
        if (active) setIsFavorite(status.isFavorite);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(getApiErrorMessage(requestError, 'Không thể tải trạng thái yêu thích.'));
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, [destinationId, initialIsFavorite, isAuthenticated]);

  const handleToggle = async () => {
    if (isAuthLoading || isLoading) return;
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: location } });
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const status = await favoriteService.toggle(destinationId);
      setIsFavorite(status.isFavorite);
      onChange?.(status.isFavorite);
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError, 'Không thể cập nhật địa điểm yêu thích.'));
    } finally {
      setIsLoading(false);
    }
  };

  const label = isFavorite ? 'Bỏ khỏi yêu thích' : 'Lưu vào yêu thích';

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => void handleToggle()}
        disabled={isAuthLoading || isLoading}
        aria-pressed={isFavorite}
        aria-label={label}
        title={error || label}
        className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-3.5 text-sm font-extrabold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70 ${
          isFavorite
            ? 'border-red-100 bg-red-50 text-red-600 hover:bg-red-100'
            : 'border-gray-200 bg-white text-gray-700 hover:border-red-100 hover:bg-red-50 hover:text-red-600'
        }`}
      >
        <TripIcon
          name={isLoading ? 'loader' : 'heart'}
          size={20}
          className={`${isLoading ? 'animate-spin' : ''} ${isFavorite ? 'fill-current' : ''}`}
        />
        {showLabel && <span>{label}</span>}
      </button>
      {error && showLabel && (
        <p className="absolute right-0 top-full z-10 mt-2 w-64 rounded-xl bg-red-50 p-2 text-xs font-semibold text-red-700 shadow-lg" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

