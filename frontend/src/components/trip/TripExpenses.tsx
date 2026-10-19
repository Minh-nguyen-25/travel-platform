import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Modal from '@/components/common/Modal';
import { expenseService, type ExpenseLedger, type TripExpense } from '@/services/expense.service';
import { formatCurrency, getApiErrorMessage } from '@/utils/trip.utils';

const categories: Record<string, string> = { FOOD: 'Ăn uống', TRANSPORT: 'Di chuyển', LODGING: 'Lưu trú', TICKET: 'Vé tham quan', SHOPPING: 'Mua sắm', OTHER: 'Khác' };
const methods: Record<string, string> = { CASH: 'Tiền mặt', BANK_TRANSFER: 'Chuyển khoản', CARD: 'Thẻ', OTHER: 'Khác' };
const field = 'mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm';
const button = 'rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold disabled:opacity-50';
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
type Action = { kind: 'edit'; expense?: TripExpense } | { kind: 'pay'; expense: TripExpense }
  | { kind: 'delete'; expense: TripExpense } | { kind: 'deletePayment'; expense: TripExpense; paymentId: number };

export default function TripExpenses({ tripId, revision }: { tripId: number; revision: unknown }) {
  const [ledger, setLedger] = useState<ExpenseLedger | null>(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const [notice, setNotice] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setLedger(await expenseService.list(tripId)); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Không thể tải sổ chi phí.')); }
    finally { setLoading(false); }
  }, [tripId]);
  useEffect(() => { void load(); }, [load, revision]);
  const open = (next: Action) => { setActionError(''); setNotice(''); setAction(next); };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!action) return;
    const data = new FormData(event.currentTarget);
    const text = (key: string) => String(data.get(key) ?? '').trim();
    setBusy(true); setActionError('');
    try {
      if (action.kind === 'edit') await expenseService.save(tripId, {
        title: text('title'), amount: Number(text('amount')), category: text('category'),
        incurredOn: text('incurredOn'), note: text('note') || null,
      }, action.expense?.id);
      else if (action.kind === 'pay') await expenseService.pay(tripId, action.expense.id, {
        amount: Number(text('amount')), method: text('method'), paidOn: text('paidOn'), reference: text('reference') || null,
      });
      else if (action.kind === 'delete') await expenseService.remove(tripId, action.expense.id);
      else await expenseService.removePayment(tripId, action.expense.id, action.paymentId);
      setAction(null); setNotice('Đã lưu sổ chi phí.'); await load();
    } catch (requestError) { setActionError(getApiErrorMessage(requestError, 'Không thể lưu thay đổi.')); }
    finally { setBusy(false); }
  };

  return <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7" aria-label="Chi phí thực tế và đối soát">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold">Chi phí thực tế & đối soát</h2>
      <p className="mt-1 text-sm text-gray-500">Theo dõi chi phí phát sinh và ghi nhận các khoản bạn đã thanh toán bên ngoài.</p></div>
      <button type="button" onClick={() => open({ kind: 'edit' })} className={`${button} bg-primary-600 text-white`}>Thêm chi phí</button></div>
    {notice && <p role="status" className="mt-3 text-sm text-green-700">{notice}</p>}
    {error && <div role="alert" className="mt-4 text-sm text-red-600">{error} <button type="button" onClick={() => void load()} className={button}>Thử lại</button></div>}
    {loading && <p className="mt-4 text-sm text-gray-500" role="status">Đang tải chi phí…</p>}
    {ledger && !error && <>
      <div className="my-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {([['Dự toán', ledger.summary.estimated], ['Thực tế', ledger.summary.actual], ['Đã thanh toán', ledger.summary.paid], ['Còn phải trả', ledger.summary.outstanding]] as const).map(([label, value]) =>
          <div key={label} className="rounded-2xl bg-primary-50 p-4"><p className="text-xs text-gray-500">{label}</p><p className="mt-2 text-lg font-extrabold text-primary-800">{formatCurrency(value)}</p></div>)}
      </div>
      <div className="mb-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <p className={Number(ledger.summary.variance) > 0 ? 'text-red-600' : 'text-green-700'}>Chênh lệch thực tế − dự toán: <strong>{formatCurrency(ledger.summary.variance)}</strong></p>
        {ledger.summary.remainingBudget !== null && <p>Ngân sách còn lại: <strong className={Number(ledger.summary.remainingBudget) < 0 ? 'text-red-600' : ''}>{formatCurrency(ledger.summary.remainingBudget)}</strong></p>}
      </div>
      {!ledger.expenses.length && <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-gray-500">Chưa ghi nhận chi phí thực tế.</p>}
      <div className="space-y-3">{ledger.expenses.map((expense) => <article key={expense.id} className="rounded-2xl border p-4">
        <div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-bold">{expense.title} <span className={`ml-2 text-xs ${expense.status === 'PAID' ? 'text-green-700' : 'text-amber-700'}`}>{expense.status === 'PAID' ? 'Đã trả đủ' : expense.status === 'PARTIAL' ? 'Trả một phần' : 'Chưa trả'}</span></h3>
          <p className="mt-1 text-xs text-gray-500">{categories[expense.category]} · {expense.incurredOn}</p>{expense.note && <p className="mt-2 text-sm text-gray-600">{expense.note}</p>}</div>
          <div className="text-right"><p className="font-extrabold">{formatCurrency(expense.amount)}</p><p className="mt-1 text-xs text-gray-500">Còn {formatCurrency(expense.outstanding)}</p></div></div>
        <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => open({ kind: 'edit', expense })} className={button}>Chỉnh chi phí</button>
          {Number(expense.outstanding) > 0 && <button type="button" onClick={() => open({ kind: 'pay', expense })} className={`${button} text-primary-700`}>Ghi nhận thanh toán</button>}
          <button type="button" onClick={() => open({ kind: 'delete', expense })} className={`${button} text-red-600`}>Xóa chi phí</button></div>
        {expense.payments.length > 0 && <details className="mt-3 text-xs"><summary className="cursor-pointer font-bold text-gray-500">{expense.payments.length} ghi nhận thanh toán</summary>
          <ul className="mt-2 space-y-2">{expense.payments.map((payment) => <li key={payment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 p-3">
            <span>{payment.paidOn} · {methods[payment.method]} · {formatCurrency(payment.amount)}{payment.reference && ` · ${payment.reference}`}</span>
            <button type="button" onClick={() => open({ kind: 'deletePayment', expense, paymentId: payment.id })} className="font-bold text-red-600">Xóa ghi nhận</button></li>)}</ul></details>}
      </article>)}</div>
    </>}
    {action && <Modal isOpen onClose={() => { if (!busy) setAction(null); }} closeOnBackdrop={!busy} title={action.kind === 'edit' ? 'Chi phí thực tế' : action.kind === 'pay' ? 'Ghi nhận thanh toán' : 'Xác nhận xóa'} size="lg">
      <form onSubmit={(event) => void submit(event)} className="space-y-4"><fieldset disabled={busy} className="space-y-4">
        {action.kind === 'edit' && <>
          <label className="block text-sm font-semibold">Nội dung<input name="title" required maxLength={200} defaultValue={action.expense?.title} className={field} /></label>
          <label className="block text-sm font-semibold">Nhóm<select name="category" defaultValue={action.expense?.category ?? 'OTHER'} className={field}>{Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="block text-sm font-semibold">Số tiền (VND)<input name="amount" type="number" required min="0.01" max="9999999999.99" step="0.01" defaultValue={action.expense?.amount} className={field} /></label>
          <label className="block text-sm font-semibold">Ngày phát sinh<input name="incurredOn" type="date" required defaultValue={action.expense?.incurredOn ?? today()} className={field} /></label>
          <label className="block text-sm font-semibold">Ghi chú<textarea name="note" maxLength={5000} defaultValue={action.expense?.note ?? ''} rows={3} className={field} /></label>
        </>}
        {action.kind === 'pay' && <>
          <p className="text-sm text-gray-600">Ghi nhận khoản đã trả cho “{action.expense.title}”. Thao tác này không chuyển tiền hoặc thu tiền từ thẻ.</p>
          <label className="block text-sm font-semibold">Số tiền (VND)<input name="amount" type="number" required min="0.01" max={action.expense.outstanding} step="0.01" defaultValue={action.expense.outstanding} className={field} /></label>
          <label className="block text-sm font-semibold">Phương thức<select name="method" className={field}>{Object.entries(methods).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="block text-sm font-semibold">Ngày thanh toán<input name="paidOn" type="date" required defaultValue={today()} className={field} /></label>
          <label className="block text-sm font-semibold">Mã giao dịch / tham chiếu<input name="reference" maxLength={200} className={field} /></label>
        </>}
        {action.kind === 'delete' && <p className="text-sm">Xóa chi phí “{action.expense.title}”? Hãy xóa các ghi nhận thanh toán của khoản này trước.</p>}
        {action.kind === 'deletePayment' && <p className="text-sm">Xóa ghi nhận thanh toán này? Khoản còn phải trả sẽ tăng tương ứng.</p>}
      </fieldset>
        {actionError && <p role="alert" className="text-sm text-red-600">{actionError}</p>}
        <div className="flex justify-end gap-3"><button type="button" disabled={busy} onClick={() => setAction(null)} className={button}>Hủy</button>
          <button type="submit" disabled={busy} className={`${button} bg-primary-600 text-white`}>{busy ? 'Đang lưu…' : action.kind.startsWith('delete') ? 'Xác nhận xóa' : 'Lưu'}</button></div>
      </form>
    </Modal>}
  </section>;
}
