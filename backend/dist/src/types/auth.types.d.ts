import { UserResponse } from './user.types';
export interface RegisterInput {
    fullName: string;
    email: string;
    password: string;
}
export interface LoginInput {
    email: string;
    password: string;
}
export interface AuthSession {
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
    user: UserResponse;
}
export type PublicAuthSession = Omit<AuthSession, 'refreshToken' | 'refreshTokenExpiresAt'>;
//# sourceMappingURL=auth.types.d.ts.map