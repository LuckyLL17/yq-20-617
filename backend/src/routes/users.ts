import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { asyncHandler, validateBody } from '../middleware/validate';
import { createUserDto, updateUserDto } from '../dtos/user.dto';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * 用户路由
 * 处理用户相关请求
 */

// 获取用户列表（仅管理员）
router.get(
  '/',
  authenticateToken,
  requireRoles([UserRole.ADMIN]),
  asyncHandler(userController.getUsers.bind(userController))
);

// 获取律师列表
router.get(
  '/lawyers',
  authenticateToken,
  asyncHandler(userController.getLawyers.bind(userController))
);

// 获取用户详情
router.get(
  '/:id',
  authenticateToken,
  asyncHandler(userController.getUserById.bind(userController))
);

// 创建用户（仅管理员）
router.post(
  '/',
  authenticateToken,
  requireRoles([UserRole.ADMIN]),
  validateBody(createUserDto),
  asyncHandler(userController.createUser.bind(userController))
);

// 更新用户（仅管理员）
router.put(
  '/:id',
  authenticateToken,
  requireRoles([UserRole.ADMIN]),
  validateBody(updateUserDto),
  asyncHandler(userController.updateUser.bind(userController))
);

// 禁用用户（仅管理员）
router.delete(
  '/:id',
  authenticateToken,
  requireRoles([UserRole.ADMIN]),
  asyncHandler(userController.deactivateUser.bind(userController))
);

export default router;
