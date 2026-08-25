import type { SVGProps } from 'react';

export type IconName =
  | 'alert-circle' | 'arrow-left' | 'arrow-right' | 'arrow-up' | 'arrow-down'
  | 'bike' | 'bus' | 'calendar' | 'car' | 'check' | 'chevron-left'
  | 'chevron-right' | 'chevron-down' | 'clock' | 'compass' | 'copy'
  | 'edit' | 'external-link' | 'eye' | 'filter' | 'globe' | 'grip'
  | 'image' | 'info' | 'link' | 'loader' | 'map-pin' | 'more'
  | 'plane' | 'plus' | 'printer' | 'refresh' | 'route' | 'search'
  | 'share' | 'sparkles' | 'star' | 'suitcase' | 'trash' | 'unlink'
  | 'users' | 'walk' | 'wallet' | 'x';

interface TripIconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

const iconPaths: Record<IconName, React.ReactNode> = {
  'alert-circle': <><circle cx="12" cy="12" r="9" /><path d="M12 7v6m0 4h.01" /></>,
  'arrow-left': <path d="m15 18-6-6 6-6" />,
  'arrow-right': <path d="m9 18 6-6-6-6" />,
  'arrow-up': <path d="m18 15-6-6-6 6" />,
  'arrow-down': <path d="m6 9 6 6 6-6" />,
  bike: <><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="m6 17 4-7 4 7m-6-3h7l-2-5h3m-6 1L8 7" /></>,
  bus: <><rect x="5" y="3" width="14" height="16" rx="3" /><path d="M7 13h10M8 19v2m8-2v2M8 7h8M8.5 16h.01m7 0h.01" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  car: <><path d="m5 17-1-4 2-5h12l2 5-1 4H5Z" /><path d="M7 17v2m10-2v2M4 13h16M8 14h.01m8 0h.01" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  'chevron-left': <path d="m15 18-6-6 6-6" />,
  'chevron-right': <path d="m9 18 6-6-6-6" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15 9-2 4-4 2 2-4 4-2Z" /></>,
  copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13 7 4 4" /></>,
  'external-link': <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></>,
  eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
  filter: <path d="M4 6h16M7 12h10m-7 6h4" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>,
  grip: <><circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="9" cy="18" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="18" r="1" fill="currentColor" stroke="none" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 20" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10h.01" /></>,
  link: <><path d="m10 13 4-4" /><path d="M7.5 16.5 5 19a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0" transform="translate(3 -3)" /><path d="m13 8 2-2a3.5 3.5 0 1 1 5 5l-4 4a3.5 3.5 0 0 1-5 0" /></>,
  loader: <><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" /></>,
  'map-pin': <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
  plane: <path d="m22 2-8.5 20-2.2-9.3L2 8.5 22 2Zm-10.7 10.7L22 2" />,
  plus: <path d="M12 5v14M5 12h14" />,
  printer: <><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v7H6z" /></>,
  refresh: <><path d="M20 7v5h-5" /><path d="M4 17v-5h5" /><path d="M6.1 8a7 7 0 0 1 11.4-2L20 8M4 16l2.5 2a7 7 0 0 0 11.4-2" /></>,
  route: <><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18h2a2 2 0 0 0 2-2V8a2 2 0 0 1 2-2h2" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
  share: <><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6" /></>,
  sparkles: <><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z" /><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14ZM5 14l.6 1.4L7 16l-1.4.6L5 18l-.6-1.4L3 16l1.4-.6L5 14Z" /></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  suitcase: <><rect x="4" y="7" width="16" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 12h16M8 11v3m8-3v3" /></>,
  trash: <><path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6" /></>,
  unlink: <><path d="m9 15-2 2a3.5 3.5 0 0 1-5-5l3-3M15 9l2-2a3.5 3.5 0 0 1 5 5l-3 3M8 12h8M3 3l18 18" /></>,
  users: <><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 20v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
  walk: <><circle cx="13" cy="4" r="2" /><path d="m10 21 2-7-3-3 2-4 4 3 3 1M6 21l3-6m5-1 3 7" /></>,
  wallet: <><path d="M4 5h14a2 2 0 0 1 2 2v13H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" /><path d="M2 8h18M15 12h7v5h-7a2.5 2.5 0 0 1 0-5Z" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
};

export default function TripIcon({
  name,
  size = 20,
  strokeWidth = 2,
  className = '',
  ...props
}: TripIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {iconPaths[name]}
    </svg>
  );
}
