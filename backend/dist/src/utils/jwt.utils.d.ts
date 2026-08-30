import { JwtPayload, RefreshTokenPayload } from '../types/common.types';
export declare const generateAccessToken: (payload: Omit<JwtPayload, "type">) => string;
export declare const verifyAccessToken: (token: string) => JwtPayload;
export declare const generateRefreshToken: (payload: Omit<RefreshTokenPayload, "type">) => {
    token: string;
    expiresAt: Date;
};
export declare const verifyRefreshToken: (token: string) => RefreshTokenPayload;
//# sourceMappingURL=jwt.utils.d.ts.map