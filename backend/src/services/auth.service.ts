import { createHash, randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { Prisma, User } from '@prisma/client';
import prisma from '../config/db';
import { HTTP_STATUS } from '../constants';
import { AuthSession, RegisterInput } from '../types/auth.types';
import { AppError } from '../utils/app-error';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.utils';
import { serializeUser } from '../utils/user.utils';

const INVALID_CREDENTIALS = 'Email hoặc mật khẩu không chính xác';
const INVALID_REFRESH_TOKEN = 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn';
const BCRYPT_ROUNDS = Math.min(14, Math.max(10, Number(process.env.BCRYPT_ROUNDS) || 12));

const isPrismaError = (error: unknown, code: string): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;

export const hashRefreshToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

const buildSession = (user: User): AuthSession => {
  const tokenId = randomUUID();
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  const refresh = generateRefreshToken({ userId: user.id, tokenId });

  return {
    accessToken,
    refreshToken: refresh.token,
    refreshTokenExpiresAt: refresh.expiresAt,
    user: serializeUser(user),
  };
};

const persistSessionWithClient = async (
  client: Prisma.TransactionClient,
  user: User
): Promise<AuthSession> => {
  const session = buildSession(user);
  const payload = verifyRefreshToken(session.refreshToken);

  await client.refreshToken.deleteMany({ where: { expiresAt: { lte: new Date() } } });
  await client.refreshToken.create({
    data: {
      id: payload.tokenId,
      userId: user.id,
      tokenHash: hashRefreshToken(session.refreshToken),
      expiresAt: session.refreshTokenExpiresAt,
    },
  });

  return session;
};

const persistSession = (user: User): Promise<AuthSession> =>
  prisma.$transaction((tx) => persistSessionWithClient(tx, user));

export const authService = {
  async register(input: RegisterInput): Promise<AuthSession> {
    const email = input.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    try {
      return await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            fullName: input.fullName.trim(),
            email,
            passwordHash,
            authProvider: 'LOCAL',
          },
        });
        return persistSessionWithClient(tx, user);
      });
    } catch (error) {
      if (isPrismaError(error, 'P2002')) {
        throw new AppError('Email đã được sử dụng', HTTP_STATUS.CONFLICT);
      }
      throw error;
    }
  },

  async login(email: string, password: string): Promise<AuthSession> {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user?.passwordHash || !user.isActive) {
      throw new AppError(INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new AppError(INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    return persistSession(user);
  },

  async loginWithUserId(userId: number): Promise<AuthSession> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new AppError('Tài khoản không tồn tại hoặc đã bị khóa', HTTP_STATUS.FORBIDDEN);
    }
    return persistSession(user);
  },

  async refresh(refreshToken: string | null): Promise<AuthSession> {
    if (!refreshToken) {
      throw new AppError(INVALID_REFRESH_TOKEN, HTTP_STATUS.UNAUTHORIZED);
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(INVALID_REFRESH_TOKEN, HTTP_STATUS.UNAUTHORIZED);
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { id: payload.tokenId },
      include: { user: true },
    });
    const tokenHash = hashRefreshToken(refreshToken);

    if (
      !storedToken ||
      storedToken.userId !== payload.userId ||
      storedToken.tokenHash !== tokenHash
    ) {
      await prisma.refreshToken.deleteMany({ where: { userId: payload.userId } });
      throw new AppError(INVALID_REFRESH_TOKEN, HTTP_STATUS.UNAUTHORIZED);
    }

    if (storedToken.expiresAt <= new Date() || !storedToken.user.isActive) {
      await prisma.refreshToken.deleteMany({ where: { userId: storedToken.userId } });
      throw new AppError(INVALID_REFRESH_TOKEN, HTTP_STATUS.UNAUTHORIZED);
    }

    const nextSession = buildSession(storedToken.user);
    const nextPayload = verifyRefreshToken(nextSession.refreshToken);

    try {
      await prisma.$transaction(async (tx) => {
        const deleted = await tx.refreshToken.deleteMany({
          where: { id: storedToken.id, tokenHash },
        });
        if (deleted.count !== 1) {
          throw new AppError(INVALID_REFRESH_TOKEN, HTTP_STATUS.UNAUTHORIZED);
        }
        await tx.refreshToken.create({
          data: {
            id: nextPayload.tokenId,
            userId: storedToken.userId,
            tokenHash: hashRefreshToken(nextSession.refreshToken),
            expiresAt: nextSession.refreshTokenExpiresAt,
          },
        });
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isPrismaError(error, 'P2002') || isPrismaError(error, 'P2025')) {
        throw new AppError(INVALID_REFRESH_TOKEN, HTTP_STATUS.UNAUTHORIZED);
      }
      throw error;
    }

    return nextSession;
  },

  async logout(refreshToken: string | null): Promise<void> {
    if (!refreshToken) return;

    try {
      const payload = verifyRefreshToken(refreshToken);
      await prisma.refreshToken.deleteMany({
        where: {
          id: payload.tokenId,
          userId: payload.userId,
          tokenHash: hashRefreshToken(refreshToken),
        },
      });
    } catch {
      // Logout idempotent: cookie vẫn bị xóa dù token hỏng hoặc đã hết hạn.
    }
  },

  async replaceAllSessionsForUser(user: User): Promise<AuthSession> {
    return prisma.$transaction(async (tx) => {
      await tx.refreshToken.deleteMany({ where: { userId: user.id } });
      return persistSessionWithClient(tx, user);
    });
  },
};
