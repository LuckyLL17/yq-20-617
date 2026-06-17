import { BillingMode, TimeEntry } from '@prisma/client';

interface BillingConfig {
  mode: BillingMode;
  hourlyRate?: number;
  fixedFee?: number;
  contingencyRate?: number;
  progressiveTiers?: ProgressiveTier[];
  mixedConfig?: MixedConfig;
}

interface ProgressiveTier {
  minAmount: number;
  maxAmount: number;
  rate: number;
}

interface MixedConfig {
  baseFee: number;
  hourlyRate: number;
  includedHours: number;
  contingencyRate?: number;
}

export interface BillingCalculationResult {
  totalLegalFee: number;
  breakdown: {
    description: string;
    amount: number;
  }[];
}

export function calculateBillingFee(
  config: BillingConfig,
  timeEntries: TimeEntry[],
  claimAmount?: number
): BillingCalculationResult {
  const breakdown: { description: string; amount: number }[] = [];
  let totalLegalFee = 0;

  const billableHours = timeEntries
    .filter(t => t.isBillable)
    .reduce((sum, t) => sum + t.hours.toNumber(), 0);

  switch (config.mode) {
    case BillingMode.HOURLY:
      const hourlyFee = billableHours * (config.hourlyRate || 0);
      breakdown.push({
        description: `计时收费 (${billableHours.toFixed(2)}小时 × ${config.hourlyRate}元/小时)`,
        amount: hourlyFee
      });
      totalLegalFee = hourlyFee;
      break;

    case BillingMode.FIXED:
      breakdown.push({
        description: '固定收费',
        amount: config.fixedFee || 0
      });
      totalLegalFee = config.fixedFee || 0;
      break;

    case BillingMode.CONTINGENCY:
      const contingencyFee = (claimAmount || 0) * (config.contingencyRate || 0) / 100;
      breakdown.push({
        description: `风险代理 (${claimAmount}元 × ${config.contingencyRate}%)`,
        amount: contingencyFee
      });
      totalLegalFee = contingencyFee;
      break;

    case BillingMode.PROGRESSIVE:
      totalLegalFee = calculateProgressiveFee(claimAmount || 0, config.progressiveTiers || [], breakdown);
      break;

    case BillingMode.MIXED:
      totalLegalFee = calculateMixedFee(
        billableHours,
        config.mixedConfig,
        claimAmount,
        breakdown
      );
      break;
  }

  return { totalLegalFee, breakdown };
}

function calculateProgressiveFee(
  amount: number,
  tiers: ProgressiveTier[],
  breakdown: { description: string; amount: number }[]
): number {
  if (tiers.length === 0) return 0;

  let totalFee = 0;
  let remainingAmount = amount;

  const sortedTiers = [...tiers].sort((a, b) => a.minAmount - b.minAmount);

  for (const tier of sortedTiers) {
    if (remainingAmount <= 0) break;

    const tierRange = tier.maxAmount - tier.minAmount;
    const taxableInTier = Math.min(remainingAmount, tierRange);
    const tierFee = taxableInTier * tier.rate / 100;

    breakdown.push({
      description: `分段收费 ${tier.minAmount}-${tier.maxAmount}元 × ${tier.rate}%`,
      amount: tierFee
    });

    totalFee += tierFee;
    remainingAmount -= taxableInTier;
  }

  return totalFee;
}

function calculateMixedFee(
  billableHours: number,
  config?: MixedConfig,
  claimAmount?: number,
  breakdown?: { description: string; amount: number }[]
): number {
  if (!config) return 0;

  let totalFee = config.baseFee;
  breakdown?.push({
    description: `基础费用`,
    amount: config.baseFee
  });

  const extraHours = Math.max(0, billableHours - config.includedHours);
  if (extraHours > 0) {
    const hourlyFee = extraHours * config.hourlyRate;
    breakdown?.push({
      description: `超工时收费 (${extraHours.toFixed(2)}小时 × ${config.hourlyRate}元/小时)`,
      amount: hourlyFee
    });
    totalFee += hourlyFee;
  }

  if (config.contingencyRate && claimAmount) {
    const contingencyFee = claimAmount * config.contingencyRate / 100;
    breakdown?.push({
      description: `风险分成 (${claimAmount}元 × ${config.contingencyRate}%)`,
      amount: contingencyFee
    });
    totalFee += contingencyFee;
  }

  return totalFee;
}

export function calculateInvoiceTotal(
  legalFee: number,
  advanceFees: Array<{ amount: number }>,
  adminFeeRate: number = 0
): {
  legalFee: number;
  advanceFeeTotal: number;
  adminFee: number;
  grandTotal: number;
} {
  const advanceFeeTotal = advanceFees.reduce((sum, f) => sum + f.amount, 0);
  const adminFee = legalFee * adminFeeRate / 100;
  const grandTotal = legalFee + advanceFeeTotal + adminFee;

  return { legalFee, advanceFeeTotal, adminFee, grandTotal };
}

export const standardProgressiveTiers: ProgressiveTier[] = [
  { minAmount: 0, maxAmount: 100000, rate: 6 },
  { minAmount: 100000, maxAmount: 500000, rate: 5 },
  { minAmount: 500000, maxAmount: 1000000, rate: 4 },
  { minAmount: 1000000, maxAmount: 5000000, rate: 3 },
  { minAmount: 5000000, maxAmount: 10000000, rate: 2 },
  { minAmount: 10000000, maxAmount: Infinity, rate: 1 }
];
