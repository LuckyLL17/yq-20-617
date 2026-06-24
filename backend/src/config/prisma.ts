import { PrismaClient } from '@prisma/client';

/**
 * Prisma 客户端单例
 * 全局共享一个数据库连接实例，避免重复创建连接
 */
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});
