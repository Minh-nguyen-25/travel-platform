import { Request, Response, NextFunction } from 'express';
import { Role } from '../constants';
export declare const requireRole: (...roles: Role[]) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=role.middleware.d.ts.map