export interface Team {
  _id: string;
  name: string;
  createdAt: string;
  billingUser?: string;
  stripeCustomerId?: string;
  isPersonal?: boolean;
  createdBy?: string;
}

export const TEAM_ROLES = ["ADMIN", "MEMBER"] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export function isTeamRole(v: unknown): v is TeamRole {
  return typeof v === "string" && (TEAM_ROLES as readonly string[]).includes(v);
}

export const TEAM_ASSIGNMENT_OPTIONS = ["temporary", "permanent"] as const;

export type TeamAssignmentOption = (typeof TEAM_ASSIGNMENT_OPTIONS)[number];

export function isTeamAssignmentOption(v: unknown): v is TeamAssignmentOption {
  return (
    typeof v === "string" &&
    (TEAM_ASSIGNMENT_OPTIONS as readonly string[]).includes(v)
  );
}
