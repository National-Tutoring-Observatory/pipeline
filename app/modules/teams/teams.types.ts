export interface Team {
  _id: string;
  name: string;
  createdAt: string;
}

export const TEAM_ASSIGNMENT_OPTIONS = ['temporary', 'permanent'] as const;

export type TeamAssignmentOption = typeof TEAM_ASSIGNMENT_OPTIONS[number];

export function isTeamAssignmentOption(v: unknown): v is TeamAssignmentOption {
  return typeof v === 'string' && (TEAM_ASSIGNMENT_OPTIONS as readonly string[]).includes(v);
}
