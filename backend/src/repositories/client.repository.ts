import { prisma } from './prisma';
import { Client } from '@prisma/client';

export class ClientRepository {
  async findAll(): Promise<Client[]> {
    return prisma.client.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string) {
    return prisma.client.findUnique({
      where: { id },
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
  }

  async findByEmail(email: string): Promise<Client | null> {
    return prisma.client.findFirst({ where: { email } });
  }

  async create(data: any): Promise<Client> {
    return prisma.client.create({ data });
  }

  async update(id: string, data: any): Promise<Client> {
    return prisma.client.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Client> {
    return prisma.client.delete({ where: { id } });
  }
}
