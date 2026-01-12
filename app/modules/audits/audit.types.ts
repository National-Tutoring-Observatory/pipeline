export interface AuditRecord {
  _id: string;
  action: string;
  performedBy: string | null;
  performedByUsername: string;
  context: Record<string, any>;
  createdAt: Date;
}
