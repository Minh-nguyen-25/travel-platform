import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import TripIcon from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';
import { authService } from '@/services/auth.service';

type Step = 'email' | 'code' | 'password' | 'success';
const inputClass = 'h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5 text-sm text-stone-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-600/10 disabled:opacity-60 motion-reduce:transition-none';
const buttonClass = 'inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-teal-800 px-4 text-sm font-semibold text-white shadow-md transition hover:from-teal-800 hover:to-teal-900 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transition-none';

export default function PasswordResetCodeFlow() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const [expiresAt, setExpiresAt] = useState(0);
  const [retryAt, setRetryAt] = useState(0);
  const [clock, setClock] = useState(Date.now());
  const resendSeconds = Math.max(0, Math.ceil((resendAt - clock) / 1000));
  const expiresSeconds = Math.max(0, Math.ceil((expiresAt - clock) / 1000));
  const retrySeconds = Math.max(0, Math.ceil((retryAt - clock) / 1000));
  const waiting = resendSeconds > 0 || retrySeconds > 0 || (expiresAt > clock && step !== 'success');

  useEffect(() => {
    if (!waiting) return undefined;
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [waiting]);

  const passwordRules = [
    { label: 'Từ 8 đến 128 ký tự', valid: password.length >= 8 && password.length <= 128 },
    { label: 'Có chữ hoa', valid: /[A-Z]/.test(password) },
    { label: 'Có chữ thường', valid: /[a-z]/.test(password) },
    { label: 'Có chữ số', valid: /[0-9]/.test(password) },
  ];

  const perform = async (action: () => Promise<void>) => {
    if (inFlight.current || retrySeconds > 0) return;
    inFlight.current = true; setBusy(true); setError('');
    try { await action(); }
    catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        const status = requestError.response?.status;
        const message = (requestError.response?.data as { message?: string } | undefined)?.message;
        if (status === 429) {
          const seconds = Number(requestError.response?.headers['retry-after']);
          const wait = Number.isFinite(seconds) && seconds > 0 ? seconds : 900;
          setRetryAt(Date.now() + wait * 1000); setClock(Date.now());
        }
        if (status === 400 && step === 'password') { setResetToken(''); setCode(''); setPassword(''); setConfirmPassword(''); setNotice(''); setStep('code'); }
        setError(message || 'Chưa thể xử lý yêu cầu. Vui lòng kiểm tra kết nối và thử lại.');
      } else setError('Chưa thể kết nối máy chủ. Vui lòng thử lại.');
    } finally { inFlight.current = false; setBusy(false); }
  };

  const requestCode = () => {
    if (resendSeconds > 0) return;
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) { setError('Vui lòng nhập địa chỉ email hợp lệ.'); return; }
    void perform(async () => {
      const result = await authService.requestResetCode(normalized);
      const now = Date.now();
      setEmail(normalized); setCode(''); setResetToken(''); setPassword(''); setConfirmPassword('');
      setResendAt(now + result.resendAfterSeconds * 1000); setExpiresAt(now + result.expiresInSeconds * 1000);
      setClock(now); setNotice(result.message); setStep('code');
    });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (step === 'email') { requestCode(); return; }
    if (!expiresSeconds) { setError('Mã đã hết hạn. Vui lòng yêu cầu mã mới.'); return; }
    if (step === 'code') {
      if (!/^\d{6}$/.test(code)) { setError('Vui lòng nhập đủ 6 chữ số trong email.'); return; }
      void perform(async () => {
        const grant = await authService.verifyResetCode(email, code);
        setResetToken(grant); setNotice('Email đã được xác minh. Hãy chọn mật khẩu mới.'); setStep('password');
      });
      return;
    }
    if (!passwordRules.every((rule) => rule.valid)) { setError('Mật khẩu chưa đáp ứng đầy đủ các yêu cầu bảo mật.'); return; }
    if (password !== confirmPassword) { setError('Mật khẩu xác nhận không khớp.'); return; }
    void perform(async () => {
      const message = await authService.resetPasswordWithCode({ email, code, resetToken, password, confirmPassword });
      setPassword(''); setConfirmPassword(''); setResetToken(''); setCode(''); setExpiresAt(0); setResendAt(0);
      setNotice(message); setStep('success');
    });
  };

  return <div className="rounded-2xl border border-stone-200/80 bg-white p-7 shadow-[0_8px_30px_-8px_rgba(15,118,110,0.10)] sm:p-8">
    <div className="mb-6 text-center">
      <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><TripIcon name={step === 'success' ? 'check' : 'refresh'} size={23} /></span>
      <h1 className="text-[22px] font-bold leading-snug text-stone-900">{step === 'success' ? 'Đặt lại mật khẩu thành công' : 'Quên mật khẩu'}</h1>
      <p className="mt-2 break-words text-[13px] leading-relaxed text-stone-500">{step === 'email' ? 'Nhập email đã đăng ký để nhận mã xác nhận 6 chữ số.' : step === 'code' ? `Nhập mã được gửi đến ${email}.` : step === 'password' ? 'Tạo mật khẩu mới để tiếp tục hành trình của bạn.' : 'Bạn có thể đăng nhập bằng mật khẩu mới.'}</p>
    </div>
    {step !== 'success' && <ol className="mb-6 flex justify-between gap-2 text-[11px] font-semibold" aria-label="Các bước khôi phục mật khẩu">
      {(['email', 'code', 'password'] as const).map((value, index) => <li key={value} aria-current={step === value ? 'step' : undefined} className={step === value ? 'text-teal-700' : 'text-stone-500'}>{index + 1}. {['Email', 'Xác minh', 'Mật khẩu mới'][index]}</li>)}
    </ol>}
    {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] leading-6 text-red-700">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl border border-teal-200 bg-teal-50 p-3 text-[13px] leading-6 text-teal-900">{notice}</p>}
    {step !== 'success' && <form onSubmit={submit} className="space-y-4" noValidate aria-busy={busy}>
      {step === 'email' && <div className="space-y-1.5">
        <label htmlFor="forgot-email" className="block text-[13px] font-semibold text-stone-700">Email tài khoản</label>
        <input id="forgot-email" type="email" name="email" autoComplete="email" maxLength={255} required disabled={busy} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ten@gmail.com" className={inputClass} />
      </div>}
      {step === 'code' && <div className="space-y-1.5">
        <label htmlFor="forgot-code" className="block text-[13px] font-semibold text-stone-700">Mã xác nhận 6 chữ số</label>
        <input id="forgot-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required disabled={busy} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} className={`${inputClass} text-center font-mono text-xl tracking-[0.4em]`} aria-describedby="code-expiry" />
      </div>}
      {step === 'password' && <>
        <div className="space-y-1.5">
          <label htmlFor="new-code-password" className="block text-[13px] font-semibold text-stone-700">Mật khẩu mới</label>
          <input id="new-code-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} maxLength={128} disabled={busy} value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} aria-describedby="password-requirements" />
        </div>
        <ul id="password-requirements" className="grid grid-cols-2 gap-2 text-[11px]">{passwordRules.map((rule) => <li key={rule.label} className={rule.valid ? 'text-teal-700' : 'text-stone-500'}>{rule.valid ? '✓' : '○'} {rule.label}</li>)}</ul>
        <div className="space-y-1.5">
          <label htmlFor="confirm-code-password" className="block text-[13px] font-semibold text-stone-700">Nhập lại mật khẩu mới</label>
          <input id="confirm-code-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required maxLength={128} disabled={busy} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClass} />
        </div>
        <label className="flex items-center gap-2 text-xs text-stone-600"><input type="checkbox" checked={showPassword} disabled={busy} onChange={(event) => setShowPassword(event.target.checked)} className="accent-teal-700" />Hiện mật khẩu</label>
      </>}
      {step !== 'email' && <p id="code-expiry" className="text-xs text-stone-500">{expiresSeconds ? `Mã còn hiệu lực ${Math.floor(expiresSeconds / 60)}:${String(expiresSeconds % 60).padStart(2, '0')}.` : 'Mã đã hết hạn. Vui lòng yêu cầu mã mới.'}</p>}
      <button type="submit" disabled={busy || retrySeconds > 0 || (step === 'email' ? !email.trim() || resendSeconds > 0 : !expiresSeconds || (step === 'code' && code.length !== 6))} className={buttonClass}>
        {busy ? <><TripIcon name="loader" size={17} className="animate-spin motion-reduce:animate-none" />Đang xử lý…</> : step === 'email' ? 'Gửi mã xác nhận' : step === 'code' ? 'Xác minh mã' : 'Đặt lại mật khẩu'}
      </button>
      {step !== 'email' && <div className="flex flex-wrap justify-between gap-3 text-xs">
        <button type="button" disabled={busy || resendSeconds > 0 || retrySeconds > 0} onClick={requestCode} className="rounded py-2 font-semibold text-teal-700 disabled:text-stone-500">{resendSeconds ? `Gửi lại mã sau ${resendSeconds}s` : 'Gửi lại mã'}</button>
        <button type="button" disabled={busy} onClick={() => { setCode(''); setResetToken(''); setPassword(''); setConfirmPassword(''); setExpiresAt(0); setStep('email'); setError(''); setNotice(''); }} className="rounded py-2 text-stone-600">Đổi email</button>
      </div>}
    </form>}
    {retrySeconds > 0 && <p className="mt-3 text-xs text-stone-500" role="status">Vui lòng thử lại sau {retrySeconds}s.</p>}
    <Link to={ROUTES.LOGIN} className={step === 'success' ? buttonClass : 'mt-5 flex items-center justify-center gap-1.5 rounded py-2 text-[13px] font-medium text-stone-600 hover:text-teal-700'}><TripIcon name="arrow-left" size={15} />Quay lại đăng nhập</Link>
  </div>;
}
