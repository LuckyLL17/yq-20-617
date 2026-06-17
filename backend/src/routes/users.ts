/**
 * 用户路由
 * 处理用户相关请求
 */

import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import { createUserDto, updateUserDto, userQueryDto } from '../dto/user.dto';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * @route GET /api/users
 * @desc 获取用户列表
 * @access Private (Admin)
 */
router.get(
  '/',
  authenticateToken,
  requireRoles([UserRole.ADMIN]),
  validateQuery(userQueryDto),
  userController.getAllUsers
);

/**
 * @route GET /api/users/lawyers
 * @desc 获取律师列表
 * @access Private
 */
router.get('/lawyers', authenticateToken, userController.getLawyers);

/**
 * @route GET /api/users/:id
 * @desc 获取用户详情
 * @access Private
 */
router.get('/:id', authenticateToken, userController.getUserById);

/**
 * @route POST /api/users
 * @desc 创建用户
 * @access Private (Admin)
 */
router.post(
  '/',
  authenticateToken,
  requireRoles([UserRole.ADMIN]),
  validateBody(createUserDto),
  userController.createUser
);

/**
 * @route PUT /api/users/:id
 * @desc 更新用户
 * @access Private (Admin)
 */
router.put(
  '/:id',
  authenticateToken,
  requireRoles([UserRole.ADMIN]),
  validateBody(updateUserDto),
  userController.updateUser
);

/**
 * @route DELETE /api/users/:id
 * @desc 删除用户（禁用）
 * @access Private (Admin)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireRoles([UserRole.ADMIN]),
  userController.deleteUser
);

export default router;
