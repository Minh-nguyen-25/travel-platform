import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response.utils';
import { HTTP_STATUS } from '../constants';

type ValidateTarget = 'body' | 'query' | 'params';

// Ví dụ dùng:
// router.post('/register', validate(registerSchema), authController.register)
// router.get('/destinations', validate(paginationSchema, 'query'), destinationController.getAll)
export const validate = (schema: ZodSchema, target: ValidateTarget = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = (result.error as ZodError).flatten().fieldErrors as Record<string, string[]>;
      sendError(res, 'Dữ liệu không hợp lệ', HTTP_STATUS.UNPROCESSABLE, errors);
      return;
    }

    // Gán dữ liệu đã được validate và parse lại vào request
    req[target] = result.data;
    next();
  };
};
