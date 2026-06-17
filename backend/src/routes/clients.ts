/**
 * 客户路由
 * 处理客户相关请求
 */

import { Router } from 'express';
import { clientController } from '../controllers/client.controller';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createClientDto, updateClientDto } from '../dto/client.dto';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * @route GET /api/clients
 * @desc 获取客户列表
 * @access Private
 */
router.get('/', authenticateToken, clientController.getAllClients);

/**
 * @route GET /api/clients/:id
 * @desc 获取客户详情
 * @access Private
 */
router.get('/:id', authenticateToken, clientController.getClientById);

/**
 * @route POST /api/clients
 * @desc 创建客户
 * @access Private
 */
router.post(
  '/',
  authenticateToken,
  validateBody(createClientDto),
  clientController.createClient
);

/**
 * @route PUT /api/clients/:id
 * @desc 更新客户
 * @access Private
 */
router.put(
  '/:id',
  authenticateToken,
  validateBody(updateClientDto),
  clientController.updateClient
);

/**
 * @route DELETE /api/clients/:id
 * @desc 删除客户
 * @access Private (Admin)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireRoles([UserRole.ADMIN]),
  clientController.deleteClient
);

export default router;
