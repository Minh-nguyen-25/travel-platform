import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../config/db';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../utils/app-error';

const money = z.number().finite().positive().max(9_999_999_999.99)
  .refine((value) => Number(value.toFixed(2)) === value, 'Số tiền chỉ có tối đa 2 chữ số thập phân');
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, 'Ngày không hợp lệ');
export const expenseSchema = z.object({
  title: z.string().trim().min(1).max(200),
  category: z.enum(['FOOD', 'TRANSPORT', 'LODGING', 'TICKET', 'SHOPPING', 'OTHER']),
  amount: money, incurredOn: date, note: z.string().trim().max(5_000).nullable().optional(),
}).strict();
export const paymentSchema = z.object({
  amount: money, method: z.enum(['CASH', 'BANK_TRANSFER', 'CARD', 'OTHER']),
  paidOn: date, reference: z.string().trim().max(200).nullable().optional(),
}).strict();

type ExpenseInput = z.infer<typeof expenseSchema>;
type PaymentInput = z.infer<typeof paymentSchema>;
const missing = () => new AppError('Không tìm thấy chi phí hoặc chuyến đi', HTTP_STATUS.NOT_FOUND);
const sum = (values: Prisma.Decimal[]) => values.reduce((total, value) => total.plus(value), new Prisma.Decimal(0));

export const assertPaymentFits = (amount: Prisma.Decimal, paid: Prisma.Decimal, next: Prisma.Decimal) => {
  if (next.lte(0) || paid.plus(next).gt(amount)) {
    throw new AppError('Số tiền thanh toán vượt quá khoản còn phải trả', HTTP_STATUS.UNPROCESSABLE);
  }
};

// Re-check ownership and balances in one serializable transaction for every write.
async function write<T>(userId: number, tripId: number, action: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        if (!await tx.trip.findFirst({ where: { id: tripId, userId }, select: { id: true } })) throw missing();
        return action(tx);
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034' && attempt < 2) continue;
      throw error;
    }
  }
}

export const expenseService = {
  async list(userId: number, tripId: number) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findFirst({ where: { id: tripId, userId }, select: { budget: true } });
      if (!trip) throw missing();
      const expenses = await tx.tripExpense.findMany({
        where: { tripId }, orderBy: [{ incurredOn: 'desc' }, { id: 'desc' }],
        include: { payments: { orderBy: { id: 'asc' } } },
      });
      const estimated = await tx.itinerary.aggregate({
        where: { tripDay: { tripId } }, _sum: { estimatedCost: true },
      });
      const actual = sum(expenses.map((expense) => expense.amount));
      const paid = sum(expenses.flatMap((expense) => expense.payments.map((payment) => payment.amount)));
      const planned = estimated._sum.estimatedCost ?? new Prisma.Decimal(0);
      return {
        expenses: expenses.map((expense) => {
          const paidAmount = sum(expense.payments.map((payment) => payment.amount));
          return { ...expense, amount: expense.amount.toFixed(2), incurredOn: expense.incurredOn.toISOString().slice(0, 10),
            paidAmount: paidAmount.toFixed(2), outstanding: expense.amount.minus(paidAmount).toFixed(2),
            status: paidAmount.eq(expense.amount) ? 'PAID' : paidAmount.gt(0) ? 'PARTIAL' : 'UNPAID',
            payments: expense.payments.map((payment) => ({ ...payment, amount: payment.amount.toFixed(2),
              paidOn: payment.paidOn.toISOString().slice(0, 10) })),
          };
        }),
        summary: { budget: trip.budget?.toFixed(2) ?? null, estimated: planned.toFixed(2),
          actual: actual.toFixed(2), paid: paid.toFixed(2), outstanding: actual.minus(paid).toFixed(2),
          variance: actual.minus(planned).toFixed(2), remainingBudget: trip.budget?.minus(actual).toFixed(2) ?? null },
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  },

  create(userId: number, tripId: number, input: ExpenseInput) {
    return write(userId, tripId, (tx) => tx.tripExpense.create({ data: {
      ...input, tripId, incurredOn: new Date(`${input.incurredOn}T00:00:00Z`),
    } }));
  },

  update(userId: number, tripId: number, id: number, input: ExpenseInput) {
    return write(userId, tripId, async (tx) => {
      const expense = await tx.tripExpense.findFirst({ where: { id, tripId }, include: { payments: true } });
      if (!expense) throw missing();
      if (new Prisma.Decimal(input.amount).lt(sum(expense.payments.map((payment) => payment.amount)))) {
        throw new AppError('Chi phí không thể nhỏ hơn số tiền đã thanh toán', HTTP_STATUS.UNPROCESSABLE);
      }
      return tx.tripExpense.update({ where: { id }, data: {
        ...input, incurredOn: new Date(`${input.incurredOn}T00:00:00Z`),
      } });
    });
  },

  remove(userId: number, tripId: number, id: number) {
    return write(userId, tripId, async (tx) => {
      const expense = await tx.tripExpense.findFirst({ where: { id, tripId }, include: { payments: true } });
      if (!expense) throw missing();
      if (expense.payments.length) throw new AppError('Hãy xóa các ghi nhận thanh toán trước khi xóa chi phí', HTTP_STATUS.CONFLICT);
      await tx.tripExpense.delete({ where: { id } });
    });
  },

  pay(userId: number, tripId: number, id: number, input: PaymentInput) {
    return write(userId, tripId, async (tx) => {
      const expense = await tx.tripExpense.findFirst({ where: { id, tripId }, include: { payments: true } });
      if (!expense) throw missing();
      assertPaymentFits(expense.amount, sum(expense.payments.map((payment) => payment.amount)), new Prisma.Decimal(input.amount));
      return tx.expensePayment.create({ data: {
        ...input, expenseId: id, paidOn: new Date(`${input.paidOn}T00:00:00Z`),
      } });
    });
  },

  removePayment(userId: number, tripId: number, expenseId: number, id: number) {
    return write(userId, tripId, async (tx) => {
      const deleted = await tx.expensePayment.deleteMany({ where: { id, expenseId, expense: { tripId } } });
      if (!deleted.count) throw missing();
    });
  },
};
