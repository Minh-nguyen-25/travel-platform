import { NextFunction, Request, Response } from 'express';
interface UserRateLimitOptions {
    namespace: string;
    maxRequests: number;
    windowMs: number;
}
interface ConcurrencyLimitOptions {
    maxGlobal: number;
    maxPerUser: number;
}
export declare const userRateLimit: ({ namespace, maxRequests, windowMs, }: UserRateLimitOptions) => (req: Request, res: Response, next: NextFunction) => void;
export declare const userConcurrencyLimit: ({ maxGlobal, maxPerUser, }: ConcurrencyLimitOptions) => (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=rateLimit.middleware.d.ts.map