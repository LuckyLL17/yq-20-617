import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { authenticateToken, requireRoles, AuthRequest } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const router = Router();

const userSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  name: z.string(),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  phone: z.string().optional(),
  department: z.string().optional(),
  hourlyRate: z.number().optional()
});

router.get('/', authenticateToken, requireRoles([UserRole.ADMIN]), async (req, res) => {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      department: true,
      hourlyRate: true,
      createdAt: true
    }
  });
  res.json(users);
});

router.get('/lawyers', authenticateToken, async (req, res) => {
  const lawyers = await prisma.user.findMany({
    where: { 
      isActive: true,
      role: UserRole.LAWYER
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phone: true,
      department: true,
      hourlyRate: true
    }
  });
  res.json(lawyers);
});

router.get('/:id', authenticateToken, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      department: true,
      hourlyRate: true,
      createdAt: true
    }
  });
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  res.json(user);
});

router.post('/', authenticateToken, requireRoles([UserRole.ADMIN]), async (req, res) => {
  try {
    const data = userSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        passwordHash
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        department: true,
        hourlyRate: true,
        createdAt: true
      }
    });
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message || '创建用户失败' });
  }
});

router.put('/:id', authenticateToken, requireRoles([UserRole.ADMIN]), async (req, res) => {
  try {
    const { password, ...data } = req.body;
    const updateData: any = { ...data };

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        department: true,
        hourlyRate: true
      }
    });
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message || '更新用户失败' });
  }
});

router.delete('/:id', authenticateToken, requireRoles([UserRole.ADMIN]), async (req, res) => {
  await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: false }
  });
  res.json({ message: '用户已禁用' });
});

export default router;
