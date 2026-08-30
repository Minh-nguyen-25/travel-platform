import { User } from '@prisma/client';
import { AuthSession, RegisterInput } from '../types/auth.types';
export declare const hashRefreshToken: (token: string) => string;
export declare const authService: {
    register(input: RegisterInput): Promise<AuthSession>;
    login(email: string, password: string): Promise<AuthSession>;
    loginWithUserId(userId: number): Promise<AuthSession>;
    refresh(refreshToken: string | null): Promise<AuthSession>;
    logout(refreshToken: string | null): Promise<void>;
    replaceAllSessionsForUser(user: User): Promise<AuthSession>;
};
//# sourceMappingURL=auth.service.d.ts.map