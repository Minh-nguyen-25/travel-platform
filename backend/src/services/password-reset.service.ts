import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import redisClient from '../config/redis';
import env from '../config/env';
import { AppError } from '../utils/app-error';
import { HTTP_STATUS, AUTH_PROVIDER } from '../constants';
import { revokeAllUserSessions } from '../utils/token-session';
import { mailService } from './mail.service';
import type { ForgotPasswordDto, ResetPasswordDto } from '../validators/auth.validator';

export const GENERIC_FORGOT_PASSWORD_MESSAGE =
  'Nếu email tồn tại và có thể đặt lại mật khẩu, chúng tôi đã gửi hướng dẫn đến email của bạn.';

export const GENERIC_RESET_TOKEN_ERROR =
  'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn';

export const RESET_PASSWORD_SUCCESS_MESSAGE =
  'Mật khẩu đã được đặt lại. Bạn có thể đăng nhập bằng mật khẩu mới.';

const BCRYPT_ROUNDS = 12;

/**
 * Cooldown Redis key to prevent mail flooding for an eligible user.
 */
const cooldownKey = (userId: number): string => `pwd_reset_cooldown:${userId}`;

/**
 * Hash raw token with SHA-256 for secure DB persistence and constant-time comparison.
 */
export const hashResetToken = (rawToken: string): string => {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

export const passwordResetService = {
  /**
   * Request password reset link.
   * STRICT ENUMERATION SAFE: Always returns the exact same generic message.
   * Only eligible active local accounts receive an email.
   */
  async requestPasswordReset(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const email = dto.email.trim().toLowerCase();

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      // Account enumeration defense:
      // If user does not exist, is not active, is not LOCAL, or has no passwordHash:
      // Return identical generic success response immediately without sending email or creating tokens.
      if (
        !user ||
        !user.isActive ||
        user.authProvider !== AUTH_PROVIDER.LOCAL ||
        !user.passwordHash ||
        user.passwordHash.trim() === ''
      ) {
        return { message: GENERIC_FORGOT_PASSWORD_MESSAGE };
      }

      // User-level cooldown defense: prevent rapid repeated emails (60s cooldown)
      const isCoolingDown = await redisClient.get(cooldownKey(user.id));
      if (isCoolingDown) {
        return { message: GENERIC_FORGOT_PASSWORD_MESSAGE };
      }
      // Set 60-second cooldown
      await redisClient.set(cooldownKey(user.id), '1', 'EX', 60);

      // Generate cryptographically secure random token (32 bytes = 64 hex chars)
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashResetToken(rawToken);
      const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_EXPIRES_SECONDS * 1000);

      // Invalidate any previous unused tokens for this user before creating a new one
      await prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });

      // Persist the hashed token
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      // Construct reset URL using FRONTEND_URL
      const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;

      // Send email via mail service
      await mailService.sendPasswordResetEmail({
        to: user.email,
        resetUrl,
        expiresMinutes: env.PASSWORD_RESET_EXPIRES_MINUTES,
        recipientName: user.fullName,
      });

      return { message: GENERIC_FORGOT_PASSWORD_MESSAGE };
    } catch (err) {
      // Catch unexpected errors and log safely without sensitive data
      console.error('[PasswordResetService] Lỗi khi xử lý yêu cầu quên mật khẩu:', (err as Error).message);
      // Still return generic success message to prevent enumeration through timing/errors
      return { message: GENERIC_FORGOT_PASSWORD_MESSAGE };
    }
  },

  /**
   * Validate reset token status without consuming it.
   * Treats non-existent, expired, used, and inactive tokens as invalid.
   * Strictly returns ONLY { valid: boolean } - never returns user or account data.
   */
  async validateResetToken(rawToken: string): Promise<{ valid: boolean }> {
    const trimmed = (rawToken || '').trim();
    if (!trimmed) {
      return { valid: false };
    }

    const tokenHash = hashResetToken(trimmed);
    const now = new Date();

    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            isActive: true,
            authProvider: true,
          },
        },
      },
    });

    if (
      !tokenRecord ||
      tokenRecord.usedAt !== null ||
      tokenRecord.expiresAt <= now ||
      !tokenRecord.user ||
      !tokenRecord.user.isActive ||
      tokenRecord.user.authProvider !== AUTH_PROVIDER.LOCAL
    ) {
      return { valid: false };
    }

    return { valid: true };
  },

  /**
   * Reset password using a single-use token.
   * Performs atomic consumption in a Prisma transaction, hashes new password,
   * and revokes all active refresh sessions for the user.
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const rawToken = dto.token.trim();
    if (!rawToken) {
      throw new AppError(GENERIC_RESET_TOKEN_ERROR, HTTP_STATUS.BAD_REQUEST);
    }

    const tokenHash = hashResetToken(rawToken);
    const now = new Date();

    // Execute atomic redemption inside transaction
    const userId = await prisma.$transaction(async (tx) => {
      // 1. Find token row
      const tokenRecord = await tx.passwordResetToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });

      // 2. Validate token existence, expiration, and unused status
      if (
        !tokenRecord ||
        tokenRecord.usedAt !== null ||
        tokenRecord.expiresAt <= now ||
        !tokenRecord.user ||
        !tokenRecord.user.isActive ||
        tokenRecord.user.authProvider !== AUTH_PROVIDER.LOCAL
      ) {
        throw new AppError(GENERIC_RESET_TOKEN_ERROR, HTTP_STATUS.BAD_REQUEST);
      }

      // 3. Atomically consume token (protect against concurrent race conditions)
      const updateResult = await tx.passwordResetToken.updateMany({
        where: {
          id: tokenRecord.id,
          usedAt: null,
          expiresAt: { gt: now },
        },
        data: {
          usedAt: now,
        },
      });

      if (updateResult.count === 0) {
        throw new AppError(GENERIC_RESET_TOKEN_ERROR, HTTP_STATUS.BAD_REQUEST);
      }

      // 4. Invalidate any other unused tokens for this user
      await tx.passwordResetToken.updateMany({
        where: {
          userId: tokenRecord.userId,
          id: { not: tokenRecord.id },
          usedAt: null,
        },
        data: {
          usedAt: now,
        },
      });

      // 5. Hash new password and update user record
      const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
      await tx.user.update({
        where: { id: tokenRecord.userId },
        data: { passwordHash },
      });

      return tokenRecord.userId;
    });

    // 6. Revoke all existing refresh sessions for this user on Redis
    try {
      await revokeAllUserSessions(userId);
    } catch (err) {
      console.warn('[PasswordResetService] Không thể thu hồi toàn bộ session Redis sau khi reset mật khẩu:', err);
    }

    // Do NOT issue access or refresh tokens. User must log in with the new password.
    return { message: RESET_PASSWORD_SUCCESS_MESSAGE };
  },
};
