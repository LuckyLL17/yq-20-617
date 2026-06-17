import { LawyerAssignment, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

/**
 * 律师分配数据访问层
 */
class LawyerAssignmentRepository extends BaseRepository<LawyerAssignment, Prisma.LawyerAssignmentCreateInput, Prisma.LawyerAssignmentUpdateInput> {
  constructor() {
    super('LawyerAssignment');
  }

  protected get model() {
    return this.prisma.lawyerAssignment;
  }

  /**
   * 创建律师分配
   */
  async createWithLawyer(data: Prisma.LawyerAssignmentCreateInput): Promise<LawyerAssignment> {
    return this.model.create({
      data,
      include: { lawyer: { select: { id: true, name: true } } }
    });
  }

  /**
   * 获取案件的律师分配列表
   */
  async findByCaseId(caseId: string): Promise<LawyerAssignment[]> {
    return this.model.findMany({
      where: { caseId },
      include: { lawyer: { select: { id: true, name: true, email: true } } }
    });
  }
}

export const lawyerAssignmentRepository = new LawyerAssignmentRepository();
