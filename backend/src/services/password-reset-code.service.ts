import { createHash, createHmac, randomInt, randomBytes, randomUUID, timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';
import type { Prisma, PrismaClient, User } from '@prisma/client';
import prisma from '../config/db';
import env from '../config/env';
import { AppError } from '../utils/app-error';
import { revokeAllUserSessions } from '../utils/token-session';
import { sendPasswordResetCodeEmail, type ResetCodeMail } from './gmail-password-reset-mail.service';
import type { VerifyResetCodeDto, ResetPasswordWithCodeDto } from '../validators/auth.validator';

export const RESET_CODE_REQUEST_MESSAGE = 'Nếu email thuộc tài khoản có thể khôi phục, mã xác nhận sẽ được gửi đến hộp thư. Vui lòng kiểm tra cả thư rác.';
export const RESET_CODE_ERROR = 'Mã xác nhận không hợp lệ, đã hết hạn hoặc đã hết lượt thử. Vui lòng yêu cầu mã mới.';
const invalidCode = () => new AppError(RESET_CODE_ERROR, 400);
const eligible = (user: User | null): user is User => Boolean(user?.isActive && user.authProvider === 'LOCAL' && user.passwordHash?.trim());
const tokenHash = (value: string) => createHash('sha256').update(value).digest('hex');
const equalHash = (a: string, b: string) => a.length === 64 && b.length === 64 && timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));

interface Dependencies {
  db: PrismaClient;
  send: (params: ResetCodeMail) => Promise<boolean>;
  revoke: (userId: number) => Promise<unknown>;
  now: () => number;
  secret: string;
  ttlSeconds: number;
  resendSeconds: number;
  maxAttempts: number;
}

/** One current code per account. PostgreSQL row locks serialize resend, verify and redeem across instances. */
export class PasswordResetCodeService {
  constructor(private readonly dependencies: Dependencies) {}

  private digest(code: string, id: string, user: User): string {
    // Binding to the existing password also invalidates codes after any other password-change flow.
    return createHmac('sha256', this.dependencies.secret)
      .update(JSON.stringify(['travelgo-password-reset-code-v1', id, user.id, user.passwordHash, code])).digest('hex');
  }

  async requestCode(email: string) {
    const { db, now, ttlSeconds, resendSeconds } = this.dependencies;
    const result = { message: RESET_CODE_REQUEST_MESSAGE, expiresInSeconds: ttlSeconds, resendAfterSeconds: resendSeconds };
    try {
      const delivery = await db.$transaction(async (tx) => {
        const users = await tx.$queryRaw<Array<{ id: number }>>`SELECT id FROM users WHERE email = ${email.trim().toLowerCase()} FOR UPDATE`;
        const user = users[0] ? await tx.user.findUnique({ where: { id: users[0].id } }) : null;
        if (!eligible(user)) return null;
        const existing = await tx.passwordResetCode.findUnique({ where: { userId: user.id } });
        const timestamp = now();
        if (existing && timestamp - existing.createdAt.getTime() < resendSeconds * 1000) return null;
        const id = randomUUID();
        let code: string;
        do { code = randomInt(0, 1_000_000).toString().padStart(6, '0'); }
        while (existing && equalHash(existing.codeHash, this.digest(code, existing.id, user)));
        const data = {
          id, userId: user.id, codeHash: this.digest(code, id, user),
          expiresAt: new Date(timestamp + ttlSeconds * 1000), createdAt: new Date(timestamp),
          attempts: 0, usedAt: null, verifiedAt: null, resetTokenHash: null,
        };
        await tx.passwordResetCode.upsert({ where: { userId: user.id }, create: data, update: data });
        return { id, mail: { to: user.email, recipientName: user.fullName, code, expiresMinutes: ttlSeconds / 60 } };
      });
      if (delivery) {
        // Do not expose SMTP/API delivery time or provider failures through the public response.
        // Failed delivery invalidates only this generation, never a newer resend.
        void this.deliver(delivery.id, delivery.mail);
      }
    } catch {
      console.warn('[ResetCode] Request could not be processed. Check database migration/connectivity.');
    }
    return result;
  }

  private async deliver(id: string, mail: ResetCodeMail): Promise<void> {
    try {
      if (await this.dependencies.send(mail)) return;
    } catch { /* Fixed, non-sensitive diagnostic below. */ }
    console.warn('[ResetCode] Code delivery failed; invalidating this request.');
    try {
      await this.dependencies.db.passwordResetCode.updateMany({ where: { id, usedAt: null }, data: { usedAt: new Date(this.dependencies.now()), resetTokenHash: null } });
    } catch { console.warn('[ResetCode] Failed-delivery cleanup could not complete. Code still expires normally.'); }
  }

  private async check<T>(email: string, code: string, action: (tx: Prisma.TransactionClient, user: User, id: string, now: Date) => Promise<T>): Promise<T> {
    const { db, now, maxAttempts } = this.dependencies;
    const outcome = await db.$transaction(async (tx) => {
      const users = await tx.$queryRaw<Array<{ id: number }>>`SELECT id FROM users WHERE email = ${email.trim().toLowerCase()} FOR UPDATE`;
      const user = users[0] ? await tx.user.findUnique({ where: { id: users[0].id } }) : null;
      if (!eligible(user)) return { valid: false as const };
      const record = await tx.passwordResetCode.findUnique({ where: { userId: user.id } });
      const timestamp = new Date(now());
      if (!record || record.usedAt || record.expiresAt <= timestamp || record.attempts >= maxAttempts) return { valid: false as const };
      if (!equalHash(record.codeHash, this.digest(code, record.id, user))) {
        // Return before throwing so failed-attempt increments COMMIT instead of rolling back.
        await tx.passwordResetCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 }, resetTokenHash: null, verifiedAt: null } });
        return { valid: false as const };
      }
      const value = await action(tx, user, record.id, timestamp);
      return { valid: true as const, value };
    }, { timeout: 15000 });
    if (!outcome.valid) throw invalidCode();
    return outcome.value;
  }

  async verifyCode(dto: VerifyResetCodeDto) {
    return this.check(dto.email, dto.code, async (tx, _user, id, timestamp) => {
      const resetToken = randomBytes(32).toString('hex');
      await tx.passwordResetCode.update({ where: { id }, data: { verifiedAt: timestamp, resetTokenHash: tokenHash(resetToken) } });
      return { resetToken };
    });
  }

  async resetPassword(dto: ResetPasswordWithCodeDto) {
    // Same policy as registration and the existing reset flow; validation also occurs in the router.
    if (dto.password !== dto.confirmPassword) throw new AppError('Mật khẩu xác nhận không khớp', 422);
    const userId = await this.check(dto.email, dto.code, async (tx, user, id, timestamp) => {
      const record = await tx.passwordResetCode.findUnique({ where: { id } });
      if (!record?.verifiedAt || !record.resetTokenHash || !equalHash(record.resetTokenHash, tokenHash(dto.resetToken))) throw invalidCode();
      const passwordHash = await bcrypt.hash(dto.password, 12);
      // Recheck the time after hashing. Never allow hashing time to extend the code's lifetime.
      const consumed = await tx.passwordResetCode.updateMany({
        where: { id, usedAt: null, expiresAt: { gt: new Date(this.dependencies.now()) }, attempts: { lt: this.dependencies.maxAttempts } },
        data: { usedAt: timestamp, resetTokenHash: null },
      });
      if (consumed.count !== 1) throw invalidCode();
      await tx.user.update({ where: { id: user.id }, data: { passwordHash } });
      await tx.passwordResetToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: timestamp } });
      await tx.refreshToken.deleteMany({ where: { userId: user.id } });
      return user.id;
    });
    try { await this.dependencies.revoke(userId); }
    catch { console.warn('[ResetCode] Password reset succeeded; Redis session cleanup failed.'); }
    return { message: 'Mật khẩu đã được đặt lại. Bạn có thể đăng nhập bằng mật khẩu mới.' };
  }
}

export const passwordResetCodeService = new PasswordResetCodeService({
  db: prisma, send: sendPasswordResetCodeEmail, revoke: revokeAllUserSessions, now: Date.now,
  secret: env.PASSWORD_RESET_CODE_SECRET, ttlSeconds: env.PASSWORD_RESET_CODE_TTL_SECONDS,
  resendSeconds: env.PASSWORD_RESET_CODE_RESEND_SECONDS, maxAttempts: env.PASSWORD_RESET_CODE_MAX_ATTEMPTS,
});
