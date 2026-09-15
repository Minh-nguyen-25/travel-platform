import type { Feedback } from './profile.utils';

interface ProfileNoticeProps {
  feedback: Feedback;
}

export default function ProfileNotice({ feedback }: ProfileNoticeProps) {
  if (!feedback) return null;
  const isSuccess = feedback.type === 'success';
  return (
    <div
      role={isSuccess ? 'status' : 'alert'}
      className={`mt-4 flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-rose-200 bg-rose-50 text-rose-700'
      }`}
    >
      <span className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs font-black ${isSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
        {isSuccess ? '✓' : '!'}
      </span>
      <span className="font-medium">{feedback.message}</span>
    </div>
  );
}
