export type Feedback = { type: 'success' | 'error'; message: string } | null;

export const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

export const getLoginMethodLabel = (user: { provider?: string; authProvider?: string }): string => {
  const p = (user.provider || user.authProvider || '').toUpperCase();
  if (p === 'GOOGLE') return 'Google';
  if (p === 'FACEBOOK') return 'Facebook';
  return 'Email và mật khẩu';
};
