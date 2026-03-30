export interface BillingPlan {
  _id: string;
  name: string;
  markupRate: number;
  isDefault: boolean;
  createdAt: Date | string;
}

export interface TeamBillingPlan {
  _id: string;
  team: string;
  plan: string | BillingPlan;
  effectiveFrom: Date | string;
  createdAt: Date | string;
}

export interface BillingPeriod {
  _id: string;
  team: string;
  plan: string;
  markupRate: number;
  startAt: Date | string;
  endAt: Date | string;
  status: "open" | "closed";
  rawCost?: number;
  billedAmount?: number;
  closingBalance?: number;
  closedAt?: Date | string;
}

export interface TeamCredit {
  _id: string;
  team: string;
  amount: number;
  addedBy: string;
  note?: string;
  stripeSessionId?: string;
  createdAt: Date | string;
}

export interface PendingPlanChange {
  plan: BillingPlan;
  effectiveFrom: Date | string;
}

export interface BalanceSummary {
  balance: number;
  credits: number;
  costs: number;
  markedUpCosts: number;
  plan: BillingPlan;
}
