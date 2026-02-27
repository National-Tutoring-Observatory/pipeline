export interface TagSpend {
  tag: string;
  logCount: number;
  totalSpend: number;
}

export interface BillingData {
  tagSpend: TagSpend | null;
  error: string | null;
}
