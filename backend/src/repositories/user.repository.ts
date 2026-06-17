import { prisma } from './prisma';
import { UserRole } from '@prisma/client';

export class UserRepository {
  async findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
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
  }

  async findAllActive() {
    return prisma.user.findMany({
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
  }

  async findLawyers() {
    return prisma.user.findMany({
      where: { isActive: true, role: UserRole.LAWYER },
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
  }

  async create(data: any) {
    return prisma.user.create({
      data,
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
  }

  async update(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data,
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
  }

  async softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, username: true, isActive: true }
    });
  }
}
