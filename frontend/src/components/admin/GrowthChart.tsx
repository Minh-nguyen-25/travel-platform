import type { DailyActivity } from '@/types/admin.types';

interface GrowthChartProps {
  data: DailyActivity[];
}

const series = [
  { key: 'newUsers', label: 'Người dùng mới', color: '#2563eb' },
  { key: 'createdTrips', label: 'Chuyến đi', color: '#8b5cf6' },
  { key: 'newReviews', label: 'Đánh giá', color: '#f59e0b' },
] as const;

const formatShortDate = (value: string): string => {
  const [, month, day] = value.split('-');
  return `${day}/${month}`;
};

export default function GrowthChart({ data }: GrowthChartProps) {
  const width = 760;
  const height = 280;
  const padding = { top: 24, right: 20, bottom: 38, left: 44 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(
    1,
    ...data.flatMap((item) => [item.newUsers, item.createdTrips, item.newReviews]),
  );
  const roundedMax = maxValue <= 5 ? 5 : Math.ceil(maxValue / 5) * 5;
  const x = (index: number): number =>
    padding.left + (data.length <= 1 ? chartWidth / 2 : (index / (data.length - 1)) * chartWidth);
  const y = (value: number): number =>
    padding.top + chartHeight - (value / roundedMax) * chartHeight;
  const pathFor = (key: (typeof series)[number]['key']): string =>
    data.map((item, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(item[key])}`).join(' ');
  const labelStep = Math.max(1, Math.ceil(data.length / 6));

  if (data.length === 0) {
    return <div className="flex h-72 items-center justify-center text-sm text-slate-400">Chưa có dữ liệu tăng trưởng.</div>;
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-4">
        {series.map((item) => (
          <span key={item.key} className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto min-w-[620px] w-full"
          role="img"
          aria-label="Biểu đồ tăng trưởng người dùng, chuyến đi và đánh giá theo ngày"
        >
          <defs>
            <linearGradient id="admin-chart-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>

          {Array.from({ length: 5 }, (_, index) => {
            const value = (roundedMax / 4) * index;
            const positionY = y(value);
            return (
              <g key={value}>
                <line x1={padding.left} x2={width - padding.right} y1={positionY} y2={positionY} stroke="#e2e8f0" strokeDasharray="4 6" />
                <text x={padding.left - 10} y={positionY + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{Math.round(value)}</text>
              </g>
            );
          })}

          <path
            d={`${pathFor('newUsers')} L ${x(data.length - 1)} ${padding.top + chartHeight} L ${x(0)} ${padding.top + chartHeight} Z`}
            fill="url(#admin-chart-area)"
          />
          {series.map((item) => (
            <g key={item.key}>
              <path d={pathFor(item.key)} fill="none" stroke={item.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {data.map((entry, index) => (
                <circle key={`${entry.date}-${item.key}`} cx={x(index)} cy={y(entry[item.key])} r="2.5" fill="white" stroke={item.color} strokeWidth="2" />
              ))}
            </g>
          ))}

          {data.map((item, index) => {
            if (index % labelStep !== 0 && index !== data.length - 1) return null;
            return <text key={item.date} x={x(index)} y={height - 10} textAnchor="middle" fontSize="10" fill="#94a3b8">{formatShortDate(item.date)}</text>;
          })}
        </svg>
      </div>
    </div>
  );
}
