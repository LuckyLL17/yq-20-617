import { PrismaClient } from '@prisma/client';

/**
 * Prisma 客户端单例
 * 确保在开发环境中避免热重载时创建多个实例
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma 客户端实例
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * 连接数据库
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
}

/**
 * 断开数据库连接
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('数据库连接已断开');
}
