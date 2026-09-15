import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import TripIcon from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';
import { destinationService } from '@/services/destination.service';
import type { Destination } from '@/types/destination.types';
import { scheduleDestinationSearch, type SearchState } from '@/utils/destination-search';
import './DestinationSearch.css';

interface DestinationSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  className?: string;
  buttonLabel?: string;
}

const requestSuggestions = async (search: string, signal: AbortSignal) => {
  const result = await destinationService.getDestinations({ search, page: 1, limit: 5, sortBy: 'rating', sortOrder: 'desc' }, signal);
  return result.data;
};

export default function DestinationSearch({ value, onChange, onSearch, className = '', buttonLabel = 'Tìm kiếm' }: DestinationSearchProps) {
  const navigate = useNavigate();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [state, setState] = useState<SearchState<Destination>>({ status: 'idle', query: '' });

  useEffect(() => {
    setActiveIndex(-1);
    if (!open) return undefined;
    return scheduleDestinationSearch(value, requestSuggestions, setState);
  }, [value, open]);

  const current = state.query === value.trim();
  const suggestions = current && state.status === 'success' ? state.data : [];
  const expanded = open && value.trim().length >= 2;

  useEffect(() => {
    if (expanded && activeIndex >= 0) {
      document.getElementById(`${id}-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  }, [expanded, activeIndex, id]);

  const choose = (destination: Destination) => {
    setOpen(false);
    navigate(ROUTES.DESTINATION_DETAIL(destination.id));
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpen(false);
    onSearch(value.trim());
  };
  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') { setOpen(false); setActiveIndex(-1); }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      if (suggestions.length) setActiveIndex((index) => event.key === 'ArrowDown'
        ? (index + 1) % suggestions.length
        : (index <= 0 ? suggestions.length - 1 : index - 1));
    }
    if (event.key === 'Enter' && expanded && activeIndex >= 0 && suggestions[activeIndex]) {
      event.preventDefault();
      choose(suggestions[activeIndex]);
    }
  };

  return (
    <div className={`destination-search relative min-w-0 text-gray-900 ${className}`} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <form onSubmit={submit} role="search" className="flex min-w-0 flex-col gap-2 rounded-2xl border border-white/40 bg-white p-2 shadow-float sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <TripIcon name="search" size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary-600" />
          <label htmlFor={id} className="sr-only">Tìm kiếm địa điểm</label>
          <input id={id} ref={inputRef} role="combobox" autoComplete="off" value={value}
            onChange={(event) => { onChange(event.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)} onKeyDown={keyDown}
            aria-autocomplete="list" aria-expanded={expanded} aria-controls={`${id}-results`}
            aria-activedescendant={expanded && activeIndex >= 0 && suggestions[activeIndex] ? `${id}-option-${activeIndex}` : undefined}
            placeholder="Tên địa điểm, thành phố, trải nghiệm…" maxLength={200}
            className="h-12 w-full rounded-xl border-0 bg-transparent pl-12 pr-11 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-primary-200" />
          {value && <button type="button" aria-label="Xóa từ khóa" onClick={() => { onChange(''); inputRef.current?.focus(); }}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"><TripIcon name="x" size={16} /></button>}
        </div>
        <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-700 px-5 text-sm font-extrabold text-white transition hover:bg-primary-800">
          {buttonLabel}<TripIcon name="arrow-right" size={17} />
        </button>
      </form>
      {expanded && <div className="destination-search__results absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white text-gray-900 shadow-float">
        <div className="border-b border-gray-100 px-4 py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Gợi ý địa điểm</div>
        <div id={`${id}-results`} role="listbox" aria-label="Địa điểm gợi ý" aria-busy={!current || state.status === 'loading'}>
          {suggestions.map((destination, index) => <button key={destination.id} id={`${id}-option-${index}`} type="button" role="option"
            aria-selected={activeIndex === index} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(destination)}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-primary-50 ${activeIndex === index ? 'bg-primary-50' : ''}`}>
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-primary-50 text-primary-700"><TripIcon name="map-pin" size={18} /></span>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{destination.name}</span><span className="mt-1 block truncate text-xs text-gray-500">{destination.address}</span></span>
            <TripIcon name="arrow-right" size={15} className="flex-none text-primary-600" />
          </button>)}
        </div>
        <p role="status" aria-live="polite" className="sr-only">{current && state.status === 'success' ? `${suggestions.length} địa điểm gợi ý` : ''}</p>
        {(!current || state.status === 'loading') && <p className="flex items-center gap-2 px-4 py-5 text-sm text-gray-500"><TripIcon name="loader" size={16} className="animate-spin" />Đang tìm gợi ý…</p>}
        {current && state.status === 'error' && <p className="px-4 py-4 text-sm text-gray-500">Chưa tải được gợi ý. Bạn vẫn có thể nhấn Tìm kiếm.</p>}
        {current && state.status === 'success' && !suggestions.length && <p className="px-4 py-4 text-sm text-gray-500">Chưa có gợi ý. Thử tên thành phố hoặc từ khóa khác.</p>}
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setOpen(false); onSearch(value.trim()); }}
          className="flex w-full items-center justify-between gap-3 border-t border-gray-100 bg-sand-50 px-4 py-3 text-left text-xs font-bold text-primary-800">
          <span className="truncate">Xem tất cả kết quả cho “{value.trim()}”</span><TripIcon name="arrow-right" size={15} className="flex-none" />
        </button>
      </div>}
    </div>
  );
}
