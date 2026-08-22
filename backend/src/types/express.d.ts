import { User } from '@prisma/client';

// Extend Express Request để có req.user sau khi qua authenticate middleware
declare global {
  namespace Express {
    interface User extends Omit<import('@prisma/client').User, 'passwordHash'> {}
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: Omit<User, 'passwordHash'>;
  }
}

export {};
