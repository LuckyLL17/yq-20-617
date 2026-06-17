import { Router } from 'express';
import { clientController } from '../controllers/client.controller';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { asyncHandler, validateBody } from '../middleware/validate';
import { createClientDto, updateClientDto } from '../dtos/client.dto';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * 客户路由
 * 处理客户相关请求
 */

// 获取客户列表
router.get(
  '/',
  authenticateToken,
  asyncHandler(clientController.getClients.bind(clientController))
);

// 获取客户详情
router.get(
  '/:id',
  authenticateToken,
  asyncHandler(clientController.getClientById.bind(clientController))
);

// 创建客户
router.post(
  '/',
  authenticateToken,
  validateBody(createClientDto),
  asyncHandler(clientController.createClient.bind(clientController))
);

// 更新客户
router.put(
  '/:id',
  authenticateToken,
  validateBody(updateClientDto),
  asyncHandler(clientController.updateClient.bind(clientController))
);

// 删除客户（仅管理员）
router.delete(
  '/:id',
  authenticateToken,
  requireRoles([UserRole.ADMIN]),
  asyncHandler(clientController.deleteClient.bind(clientController))
);

export default router;
