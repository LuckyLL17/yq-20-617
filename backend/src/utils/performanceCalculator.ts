import { TimeEntry, Prisma } from '@prisma/client';

interface LawyerAssignmentWithLawyer {
  lawyerId: string;
  role: string;
  allocation: Prisma.Decimal;
  isLead: boolean;
  lawyer?: { id: string; name: string } | null;
}

interface PerformanceShareResult {
  lawyerId: string;
  lawyerName: string;
  totalHours: number;
  timeShare: number;
  contribution: number;
  shareRatio: number;
  allocatedFee: number;
}

const ROLE_WEIGHTS: Record<string, number> = {
  '主办律师': 2.0,
  '协办律师': 1.2,
  '律师助理': 0.8,
  '实习生': 0.5
};

const TASK_WEIGHTS: Record<string, number> = {
  '出庭': 2.0,
  '文书撰写': 1.5,
  '客户沟通': 1.2,
  '法律研究': 1.0,
  '证据整理': 0.8,
  '行政事务': 0.5
};

export function calculatePerformanceShares(
  timeEntries: TimeEntry[],
  lawyerAssignments: LawyerAssignmentWithLawyer[],
  totalFee: number
): PerformanceShareResult[] {
  const lawyerHours: Map<string, number> = new Map();
  const lawyerContribution: Map<string, number> = new Map();
  const lawyerNames: Map<string, string> = new Map();

  let totalWeightedHours = 0;

  for (const entry of timeEntries) {
    const hours = entry.hours.toNumber();
    const currentHours = lawyerHours.get(entry.lawyerId) || 0;
    lawyerHours.set(entry.lawyerId, currentHours + hours);

    const taskType = entry.taskType || '其他';
    const taskWeight = TASK_WEIGHTS[taskType] || 1.0;
    const weightedHours = hours * taskWeight;

    const currentContribution = lawyerContribution.get(entry.lawyerId) || 0;
    lawyerContribution.set(entry.lawyerId, currentContribution + weightedHours);
    totalWeightedHours += weightedHours;
  }

  for (const assignment of lawyerAssignments) {
    const role = assignment.role;
    const roleWeight = ROLE_WEIGHTS[role] || 1.0;
    const currentContribution = lawyerContribution.get(assignment.lawyerId) || 0;
    lawyerContribution.set(assignment.lawyerId, currentContribution * roleWeight);

    if (assignment.lawyer) {
      lawyerNames.set(assignment.lawyerId, assignment.lawyer.name || '未知');
    }
  }

  if (totalWeightedHours === 0) {
    totalWeightedHours = 1;
  }

  const results: PerformanceShareResult[] = [];
  const totalHours = Array.from(lawyerHours.values()).reduce((a, b) => a + b, 0);

  for (const [lawyerId, hours] of lawyerHours) {
    const contribution = lawyerContribution.get(lawyerId) || 0;
    const shareRatio = contribution / totalWeightedHours;
    const allocatedFee = totalFee * shareRatio;

    results.push({
      lawyerId,
      lawyerName: lawyerNames.get(lawyerId) || '未知',
      totalHours: hours,
      timeShare: totalHours > 0 ? hours / totalHours : 0,
      contribution: shareRatio,
      shareRatio,
      allocatedFee
    });
  }

  return results.sort((a, b) => b.shareRatio - a.shareRatio);
}

export function calculateTeamDistribution(
  individualShares: PerformanceShareResult[],
  teamAllocations: Array<{ teamId: string; allocationRatio: number }>
): Array<{ teamId: string; amount: number; members: PerformanceShareResult[] }> {
  const results: Array<{ teamId: string; amount: number; members: PerformanceShareResult[] }> = [];
  const totalFee = individualShares.reduce((sum, s) => sum + s.allocatedFee, 0);

  for (const team of teamAllocations) {
    const teamAmount = totalFee * team.allocationRatio;
    const teamMembers = individualShares.slice(0, Math.ceil(individualShares.length * team.allocationRatio));

    const memberTotal = teamMembers.reduce((sum, m) => sum + m.allocatedFee, 0);
    const adjustedMembers = memberTotal > 0
      ? teamMembers.map(m => ({
          ...m,
          allocatedFee: (m.allocatedFee / memberTotal) * teamAmount
        }))
      : teamMembers;

    results.push({
      teamId: team.teamId,
      amount: teamAmount,
      members: adjustedMembers
    });
  }

  return results;
}

export function generatePerformanceReport(
  shares: PerformanceShareResult[],
  period: { start: Date; end: Date }
) {
  const totalFee = shares.reduce((sum, s) => sum + s.allocatedFee, 0);
  const totalHours = shares.reduce((sum, s) => sum + s.totalHours, 0);

  return {
    period,
    summary: {
      totalLawyers: shares.length,
      totalHours,
      totalFee,
      averageHourlyRate: totalHours > 0 ? totalFee / totalHours : 0
    },
    rankings: shares.map((s, index) => ({
      rank: index + 1,
      ...s
    }))
  };
}
