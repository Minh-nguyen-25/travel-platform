import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import EditorialPageHero from '@/components/common/EditorialPageHero';
import TripIcon from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { aiService } from '@/services/ai.service';
import type { AiChatMessage, AiChatResult } from '@/types/ai.types';
import { getApiErrorMessage } from '@/utils/trip.utils';

interface ChatMessage extends AiChatMessage {
  id: string;
  isWelcome?: boolean;
}

const quickPrompts = [
  'Tóm tắt chuyến đi sắp tới của tôi',
  'Gợi ý địa điểm phù hợp sở thích của tôi',
  'Tư vấn lịch trình Đà Nẵng 3 ngày',
  'Tôi nên chuẩn bị gì trước chuyến đi?',
];

const createMessage = (
  role: AiChatMessage['role'],
  content: string,
  isWelcome = false,
): ChatMessage => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  role,
  content,
  isWelcome,
});

const welcomeMessage = (name?: string): ChatMessage => createMessage(
  'assistant',
  `Xin chào${name ? ` ${name}` : ''}! Mình có thể tư vấn điểm đến, giải thích lịch trình đã lưu hoặc giúp bạn chuẩn bị cho chuyến đi. Bạn muốn bắt đầu từ đâu?`,
  true,
);

export default function AiChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [welcomeMessage(user?.fullName)]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [lastResult, setLastResult] = useState<AiChatResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [isSending, messages]);

  const conversationHistory = useMemo<AiChatMessage[]>(() => messages
    .filter((message) => !message.isWelcome)
    .slice(-12)
    .map(({ role, content }) => ({ role, content: content.slice(0, 4_000) })), [messages]);

  const sendMessage = async (rawMessage: string) => {
    const message = rawMessage.trim();
    if (!message || isSending) return;
    if (message.length > 2_000) {
      setError('Tin nhắn không được vượt quá 2.000 ký tự.');
      return;
    }

    const history = conversationHistory;
    setMessages((current) => [...current, createMessage('user', message)]);
    setDraft('');
    setError('');
    setIsSending(true);

    try {
      const result = await aiService.chat({
        message,
        history,
        locale: 'vi-VN',
      });
      setMessages((current) => [...current, createMessage('assistant', result.reply)]);
      setLastResult(result);
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(
        requestError,
        'AI chưa thể trả lời lúc này. Vui lòng thử lại sau.',
      ));
    } finally {
      setIsSending(false);
    }
  };

  const resetConversation = () => {
    if (isSending) return;
    setMessages([welcomeMessage(user?.fullName)]);
    setDraft('');
    setError('');
    setLastResult(null);
  };

  return (
    <div className="trip-page-bg min-h-screen pb-20">
      <EditorialPageHero
        eyebrow="TravelGo AI Chat"
        title={<>Hỏi nhanh. <span className="text-primary-200">Đi tự tin hơn.</span></>}
        description="Trò chuyện cùng trợ lý hiểu sở thích, các chuyến đi đã lưu và danh mục địa điểm của TravelGo."
        image="/images/vietnam-ai-planner.jpg"
        imageAlt="Bản đồ và hành trang cho một chuyến du lịch Việt Nam"
        icon="sparkles"
        motion="glide"
        imagePosition="object-[62%_50%]"
        compact
      >
        <div className="flex flex-wrap gap-3 text-xs font-bold text-white/75">
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">Hiểu chuyến đi đã lưu</span>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">Cá nhân hóa sở thích</span>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">Tư vấn bằng tiếng Việt</span>
        </div>
      </EditorialPageHero>

      <main className="container py-8 sm:py-10">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-primary-900/5" aria-label="Trò chuyện với trợ lý AI">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-700 text-white shadow-lg shadow-primary-200">
                  <TripIcon name="sparkles" size={20} />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-secondary-500" />
                </span>
                <div>
                  <h2 className="text-sm font-extrabold text-gray-900">Trợ lý du lịch</h2>
                  <p className="mt-0.5 text-[11px] font-semibold text-gray-500">Sẵn sàng tư vấn hành trình của bạn</p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetConversation}
                disabled={isSending}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 transition hover:border-primary-200 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <TripIcon name="refresh" size={14} />
                Cuộc trò chuyện mới
              </button>
            </div>

            <div className="min-h-[420px] max-h-[62vh] space-y-5 overflow-y-auto bg-sand-50/55 px-4 py-6 sm:px-6" aria-live="polite">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`trip-fade-in flex items-end gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <span className="mb-1 flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-primary-700 text-white shadow-sm">
                      <TripIcon name="sparkles" size={14} />
                    </span>
                  )}
                  <div className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[76%] ${message.role === 'user'
                    ? 'rounded-br-md bg-primary-700 text-white'
                    : 'rounded-bl-md border border-gray-100 bg-white text-gray-700'
                  }`}>
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="trip-fade-in flex items-end gap-2.5" role="status">
                  <span className="mb-1 flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-primary-700 text-white">
                    <TripIcon name="sparkles" size={14} />
                  </span>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-gray-100 bg-white px-4 py-4 shadow-sm">
                    {[0, 1, 2].map((index) => (
                      <span
                        key={index}
                        className="h-2 w-2 animate-bounce rounded-full bg-primary-400"
                        style={{ animationDelay: `${index * 120}ms` }}
                      />
                    ))}
                    <span className="sr-only">AI đang trả lời</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-100 bg-white p-4 sm:p-5">
              {messages.length === 1 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="rounded-full border border-primary-100 bg-primary-50 px-3 py-2 text-left text-xs font-bold text-primary-800 transition hover:border-primary-300 hover:bg-primary-100"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {error && (
                <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs leading-5 text-error" role="alert">
                  <TripIcon name="alert-circle" size={16} className="mt-0.5 flex-none" />
                  <span>{error}</span>
                </div>
              )}

              <form
                className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-2 transition focus-within:border-primary-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-50"
                onSubmit={(event) => {
                  event.preventDefault();
                  void sendMessage(draft);
                }}
              >
                <label htmlFor="ai-chat-message" className="sr-only">Nhập câu hỏi cho trợ lý AI</label>
                <textarea
                  id="ai-chat-message"
                  rows={2}
                  maxLength={2_000}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage(draft);
                    }
                  }}
                  disabled={isSending}
                  placeholder="Ví dụ: Đà Nẵng 3 ngày nên đi đâu?"
                  className="max-h-36 min-h-[52px] flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={isSending || !draft.trim()}
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary-700 text-white shadow-md transition hover:-translate-y-0.5 hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                  aria-label="Gửi tin nhắn"
                >
                  <TripIcon name={isSending ? 'loader' : 'arrow-up'} size={18} className={isSending ? 'animate-spin' : ''} />
                </button>
              </form>
              <div className="mt-2 flex items-center justify-between gap-3 px-1 text-[10px] text-gray-400">
                <span>Enter để gửi · Shift + Enter để xuống dòng</span>
                <span>{draft.length}/2.000</span>
              </div>
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24" aria-label="Thông tin trợ lý AI">
            <div className="rounded-3xl bg-navy-900 p-5 text-white shadow-lg">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <TripIcon name="compass" size={19} />
              </span>
              <h2 className="mt-4 text-lg font-extrabold text-white">Muốn lưu lịch trình?</h2>
              <p className="mt-2 text-xs leading-5 text-white/65">
                AI Chat phù hợp để hỏi nhanh. AI Planner sẽ tạo lịch trình theo ngày, tính chi phí và cho phép lưu vào chuyến đi.
              </p>
              <Link
                to={ROUTES.PREFERENCES}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-extrabold text-navy-900 transition hover:bg-primary-50 hover:text-primary-800"
              >
                Mở AI Planner
                <TripIcon name="arrow-right" size={15} />
              </Link>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                  <TripIcon name="info" size={17} />
                </span>
                <div>
                  <h2 className="text-sm font-extrabold text-gray-900">Ngữ cảnh được dùng</h2>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Sở thích, tối đa 5 chuyến đi gần đây và danh mục địa điểm đang hoạt động của hệ thống.
                  </p>
                </div>
              </div>
              {lastResult && (
                <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 text-center">
                  <div className="rounded-xl bg-gray-50 px-2 py-3">
                    <dt className="text-[10px] font-bold uppercase tracking-normal text-gray-400">Chuyến đi</dt>
                    <dd className="mt-1 text-lg font-extrabold text-gray-900">{lastResult.context.tripCount}</dd>
                  </div>
                  <div className="rounded-xl bg-gray-50 px-2 py-3">
                    <dt className="text-[10px] font-bold uppercase tracking-normal text-gray-400">Địa điểm</dt>
                    <dd className="mt-1 text-lg font-extrabold text-gray-900">{lastResult.context.destinationCount}</dd>
                  </div>
                </dl>
              )}
            </div>

            <p className="px-2 text-center text-[10px] leading-4 text-gray-400">
              AI có thể nhầm lẫn. Hãy kiểm tra lại giá vé, giờ mở cửa, thời tiết và thông tin an toàn trước chuyến đi.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
