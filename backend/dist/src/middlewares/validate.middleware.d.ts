import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
type ValidateTarget = 'body' | 'query' | 'params';
export declare const validate: (schema: ZodSchema, target?: ValidateTarget) => (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validate.middleware.d.ts.map