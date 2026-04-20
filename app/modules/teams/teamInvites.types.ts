export interface TeamInvite {
  _id: string;
  team: string;
  name: string;
  slug: string;
  role: "MEMBER";
  maxUses: number;
  usedCount: number;
  revokedAt?: string;
  revokedBy?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export type TeamInviteStatus = "active" | "revoked" | "full" | "expired";
