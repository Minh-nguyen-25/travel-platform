import axiosClient from '@/api/axiosClient';

export interface ExpensePayment { id: number; amount: string; method: string; reference: string | null; paidOn: string }
export interface TripExpense {
  id: number; title: string; category: string; amount: string; incurredOn: string; note: string | null;
  paidAmount: string; outstanding: string; status: 'PAID' | 'PARTIAL' | 'UNPAID'; payments: ExpensePayment[];
}
export interface ExpenseLedger {
  expenses: TripExpense[];
  summary: { budget: string | null; estimated: string; actual: string; paid: string; outstanding: string;
    variance: string; remainingBudget: string | null };
}
export interface ExpensePayload { title: string; category: string; amount: number; incurredOn: string; note: string | null }
export interface PaymentPayload { amount: number; method: string; reference: string | null; paidOn: string }
export const expenseService = {
  async list(tripId: number): Promise<ExpenseLedger> {
    return (await axiosClient.get<{ data: ExpenseLedger }>(`/trips/${tripId}/expenses`)).data.data;
  },
  async save(tripId: number, payload: ExpensePayload, expenseId?: number) {
    const url = `/trips/${tripId}/expenses`;
    if (expenseId) await axiosClient.patch(`${url}/${expenseId}`, payload);
    else await axiosClient.post(url, payload);
  },
  async remove(tripId: number, expenseId: number) { await axiosClient.delete(`/trips/${tripId}/expenses/${expenseId}`); },
  async pay(tripId: number, expenseId: number, payload: PaymentPayload) {
    await axiosClient.post(`/trips/${tripId}/expenses/${expenseId}/payments`, payload);
  },
  async removePayment(tripId: number, expenseId: number, paymentId: number) {
    await axiosClient.delete(`/trips/${tripId}/expenses/${expenseId}/payments/${paymentId}`);
  },
};
