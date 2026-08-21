import { PrismaClient } from '@prisma/client';

// Singleton pattern — toàn project chỉ dùng một instance này
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
