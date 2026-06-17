import { Router } from 'express';
import { prisma } from '../index';
import { authenticateToken, requireRoles, AuthRequest } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const router = Router();

const clientSchema = z.object({
  name: z.string(),
  type: z.string(),
  idNumber: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional()
});

router.get('/', authenticateToken, async (req, res) => {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.json(clients);
});

router.get('/:id', authenticateToken, async (req, res) => {
  const client = await prisma.client.findUnique({
    where: { id: req.params.id },
    include: {
      cases: {
        select: {
          id: true,
          caseNumber: true,
          title: true,
          status: true,
          createdAt: true
        }
      }
    }
  });
  if (!client) {
    return res.status(404).json({ error: '客户不存在' });
  }
  res.json(client);
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = clientSchema.parse(req.body);
    const client = await prisma.client.create({
      data
    });
    res.status(201).json(client);
  } catch (error: any) {
    res.status(400).json({ error: error.message || '创建客户失败' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(client);
  } catch (error: any) {
    res.status(400).json({ error: error.message || '更新客户失败' });
  }
});

router.delete('/:id', authenticateToken, requireRoles([UserRole.ADMIN]), async (req, res) => {
  await prisma.client.delete({
    where: { id: req.params.id }
  });
  res.json({ message: '客户已删除' });
});

export default router;
