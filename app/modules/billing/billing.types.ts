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
  createdAt: Date | string;
}

export interface TeamCredit {
  _id: string;
  team: string;
  amount: number;
  addedBy: string;
  note?: string;
  createdAt: Date | string;
}

export interface BalanceSummary {
  balance: number;
  credits: number;
  costs: number;
  markedUpCosts: number;
  plan: BillingPlan;
}
