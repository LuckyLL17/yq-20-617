import { TimeEntry, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

/**
 * 时间条目数据访问层
 */
class TimeEntryRepository extends BaseRepository<TimeEntry, Prisma.TimeEntryCreateInput, Prisma.TimeEntryUpdateInput> {
  constructor() {
    super('TimeEntry');
  }

  protected get model() {
    return this.prisma.timeEntry;
  }

  /**
   * 创建时间条目（包含律师信息）
   */
  async createWithLawyer(data: Prisma.TimeEntryCreateInput): Promise<TimeEntry> {
    return this.model.create({
      data,
      include: { lawyer: { select: { id: true, name: true } } }
    });
  }

  /**
   * 获取案件的时间条目列表
   */
  async findByCaseId(caseId: string): Promise<TimeEntry[]> {
    return this.model.findMany({
      where: { caseId },
      include: { lawyer: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' }
    });
  }

  /**
   * 获取律师的时间条目
   */
  async findByLawyerId(lawyerId: string): Promise<TimeEntry[]> {
    return this.model.findMany({
      where: { lawyerId },
      orderBy: { date: 'desc' }
    });
  }
}

export const timeEntryRepository = new TimeEntryRepository();
