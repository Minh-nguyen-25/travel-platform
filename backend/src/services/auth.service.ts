import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../utils/app-error';
import { generateAccessToken } from '../utils/jwt.utils';

export const authService = {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user?.passwordHash || !user.isActive) {
      throw new AppError('Email hoặc mật khẩu không chính xác', HTTP_STATUS.UNAUTHORIZED);
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new AppError('Email hoặc mật khẩu không chính xác', HTTP_STATUS.UNAUTHORIZED);
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const { passwordHash: _passwordHash, ...safeUser } = user;

    return { accessToken, user: safeUser };
  },
};
